// Standalone helper: attach realistic images to existing Lost/Found records
// using ONLY the running application APIs (API Gateway :8080).
// This is NOT application code and does NOT modify source files.
// Phase 1: build a curated source list.
// Phase 2: download and upload each image individually.

const API_BASE = 'http://localhost:8080'
const TOKEN = process.argv[2] || process.env.LF_TOKEN

if (!TOKEN) {
  console.error('Usage: node add_images_to_records.js <JWT_TOKEN>')
  console.error('Or set the LF_TOKEN environment variable.')
  process.exit(1)
}

// Items already processed in earlier runs.
const ALREADY_PROCESSED = new Set(['lost:11'])

// Curated search terms. The script will first try the specific term, then fall back.
const searchTermMap = {
  'Blue College Backpack': ['blue college backpack', 'blue backpack'],
  'Samsung Galaxy Smartphone': ['samsung galaxy smartphone', 'samsung smartphone'],
  'Brown Leather Wallet': ['brown leather wallet', 'brown wallet'],
  'White Wireless Earbuds': ['wireless earbuds', 'bluetooth earbuds', 'airpods'],
  'Dell Laptop Charger': ['dell laptop charger', 'laptop power adapter'],
  'College ID Card': ['college id card', 'student identity card'],
  'Black Spectacles': ['black spectacles', 'black eyeglasses'],
  'Red Water Bottle': ['red water bottle', 'water bottle'],
  'Black Jacket': ['black jacket', 'jacket'],
  'Black Analog Watch': ['black analog watch', 'black wristwatch'],
  'Blue Backpack': ['blue backpack'],
  'Samsung Mobile Phone': ['samsung mobile phone', 'samsung smartphone'],
  'Brown Wallet': ['brown wallet', 'brown leather wallet'],
  'Laptop Charger': ['laptop charger', 'laptop power adapter'],
  'Student ID Card': ['student id card', 'student identity card'],
  'Black Eyeglasses': ['black eyeglasses', 'black spectacles'],
  'Blue Water Bottle': ['blue water bottle', 'water bottle'],
  'Navy Blue Hoodie': ['navy blue hoodie', 'navy hoodie']
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const apiGet = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  return response.json()
}

const USER_AGENT = 'LostFoundDataAgent/1.0 (educational data population)'

const fetchText = async (url, retries = 3, baseDelay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      const text = await response.text()
      if (text.trim().startsWith('You are making')) {
        throw new Error('Rate limited')
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return text
    } catch (error) {
      if (attempt === retries) throw error
      console.log(`    Wikimedia retry ${attempt}/${retries} after ${baseDelay * attempt}ms...`)
      await delay(baseDelay * attempt)
    }
  }
}

const searchWikimediaImage = async (queries) => {
  for (const query of queries) {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`
    const text = await fetchText(searchUrl)
    const data = JSON.parse(text)
    const results = data?.query?.search || []

    for (const result of results) {
      const title = result.title
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=400&format=json`
      const infoText = await fetchText(infoUrl)
      const infoData = JSON.parse(infoText)
      const page = Object.values(infoData.query.pages)[0]
      const imageInfo = page?.imageinfo?.[0]

      if (imageInfo && imageInfo.mime && imageInfo.mime.startsWith('image/')) {
        return {
          title,
          url: imageInfo.thumburl || imageInfo.url,
          mime: imageInfo.mime,
          width: imageInfo.thumbwidth || imageInfo.width,
          height: imageInfo.thumbheight || imageInfo.height
        }
      }
    }
  }
  return null
}

const downloadImage = async (url) => {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.length > 900 * 1024) {
    throw new Error(`Image too large (${(buffer.length / 1024).toFixed(0)} KB)`)
  }
  return { buffer, mime: response.headers.get('content-type') || 'image/jpeg' }
}

const updateRecordWithImage = async (type, id, record, imageBuffer, mimeType) => {
  const dateField = type === 'lost' ? 'lostDate' : 'foundDate'
  const extension = mimeType === 'image/png' ? 'png' : 'jpg'
  const filename = `${type}_item_${id}.${extension}`

  const form = new FormData()
  form.append('itemName', record.itemName)
  form.append('description', record.description || '')
  form.append('category', record.category || '')
  form.append('location', record.location || '')
  form.append(dateField, record[dateField] || new Date().toISOString().split('T')[0])
  form.append('image', new Blob([imageBuffer], { type: mimeType }), filename)

  const response = await fetch(`${API_BASE}/${type}/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  })

  return response.json()
}

const getCurrentUserId = async () => {
  const response = await apiGet('/user/profile')
  if (response.status && response.data) {
    return response.data.id
  }
  throw new Error('Failed to get current user profile')
}

const processRecords = async () => {
  const lostResponse = await apiGet('/lost/all')
  const foundResponse = await apiGet('/found/all')

  const lostItems = lostResponse.data || []
  const foundItems = foundResponse.data || []

  const myUserId = await getCurrentUserId()

  // LostItemResponse does not expose imageUrl/imagePublicId, so we rely on the
  // earlier successful PUT for LOST #11 and skip it to avoid re-uploading.
  const toProcess = [
    ...lostItems.map((item) => ({ type: 'lost', ...item })),
    ...foundItems.map((item) => ({ type: 'found', ...item }))
  ].filter((item) => {
    if (item.userId !== myUserId) return false
    if (ALREADY_PROCESSED.has(`${item.type}:${item.id}`)) return false
    if (item.imageUrl || item.imagePublicId) return false
    return true
  })

  console.log(`Records checked: ${lostItems.length} lost, ${foundItems.length} found`)
  console.log(`Records to process: ${toProcess.length}`)
  console.log(`Current user ID: ${myUserId}`)

  if (toProcess.length === 0) {
    console.log('No records need images.')
    return
  }

  // Phase 1: build curated source list.
  console.log('\n=== Phase 1: Building curated image source list ===')
  const sourceList = []

  for (let i = 0; i < toProcess.length; i++) {
    const record = toProcess[i]
    const queries = searchTermMap[record.itemName] || [record.itemName]

    console.log(`[${i + 1}/${toProcess.length}] Finding source for ${record.type.toUpperCase()} #${record.id}: ${record.itemName}`)
    console.log(`  Queries: ${queries.join(' | ')}`)

    try {
      const imageInfo = await searchWikimediaImage(queries)
      if (imageInfo) {
        sourceList.push({ record, imageInfo })
        console.log(`  Source: ${imageInfo.title} (${imageInfo.width}x${imageInfo.height})`)
      } else {
        sourceList.push({ record, imageInfo: null, reason: 'No suitable image found' })
        console.log('  Source: NOT FOUND')
      }
    } catch (error) {
      sourceList.push({ record, imageInfo: null, reason: error.message })
      console.log(`  Source: ERROR - ${error.message}`)
    }

    await delay(5000)
  }

  // Phase 2: download and upload.
  console.log('\n=== Phase 2: Downloading and uploading images ===')
  const results = []

  for (let i = 0; i < sourceList.length; i++) {
    const { record, imageInfo, reason } = sourceList[i]

    console.log(`\n[${i + 1}/${sourceList.length}] ${record.type.toUpperCase()} #${record.id}: ${record.itemName}`)

    if (!imageInfo) {
      results.push({ ...record, success: false, reason: reason || 'No source image' })
      console.log(`  Result: SKIPPED - ${reason}`)
      continue
    }

    try {
      const { buffer, mime } = await downloadImage(imageInfo.url)
      console.log(`  Downloaded: ${buffer.length} bytes (${mime})`)

      const updateResponse = await updateRecordWithImage(record.type, record.id, record, buffer, mime)

      if (updateResponse.status) {
        const updatedData = updateResponse.data || {}
        results.push({
          ...record,
          success: true,
          imageUrl: updatedData.imageUrl,
          imagePublicId: updatedData.imagePublicId,
          sourceTitle: imageInfo.title
        })
        console.log(`  Result: SUCCESS`)
        console.log(`  Cloudinary URL: ${updatedData.imageUrl}`)
      } else {
        results.push({ ...record, success: false, reason: updateResponse.message || 'Update failed' })
        console.log(`  Result: FAILED - ${updateResponse.message}`)
      }
    } catch (error) {
      results.push({ ...record, success: false, reason: error.message })
      console.log(`  Result: ERROR - ${error.message}`)
    }

    await delay(2000)
  }

  // Final report.
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)
  const alreadyHasImage = [...lostItems, ...foundItems].filter((item) => item.imageUrl || item.imagePublicId).length
  const notOwned = [...lostItems, ...foundItems].filter((item) => item.userId !== myUserId && !item.imageUrl && !item.imagePublicId).length

  console.log('\n========== FINAL RESULTS ==========')
  console.log(`Total Lost records checked:     ${lostItems.length}`)
  console.log(`Total Found records checked:    ${foundItems.length}`)
  console.log(`Records already having images:  ${alreadyHasImage + ALREADY_PROCESSED.size}`)
  console.log(`Records not owned by user ${myUserId}:       ${notOwned}`)
  console.log(`Images successfully attached in this run: ${successful.length}`)
  console.log(`Records that could not receive images: ${failed.length}`)
  console.log('Image storage: Cloudinary (via existing application image service)')
  console.log('Application code modified: NONE')

  if (failed.length) {
    console.log('\nFailures this run:')
    failed.forEach((f) => console.log(`  - ${f.type.toUpperCase()} #${f.id} (${f.itemName}): ${f.reason}`))
  }

  console.log('\nSuccessfully attached images this run:')
  successful.forEach((s) => console.log(`  - ${s.type.toUpperCase()} #${s.id} (${s.itemName})`))
  console.log('    Source files:')
  successful.forEach((s) => console.log(`      ${s.sourceTitle} -> ${s.imageUrl}`))
  console.log('===================================')
}

processRecords().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
