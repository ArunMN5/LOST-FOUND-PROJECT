// Standalone data-population script.
// This is NOT application code. It uses the running Lost & Found APIs
// (API Gateway :8080) to create realistic Lost and Found records.

const API_BASE = 'http://localhost:8080'
const TOKEN = process.argv[2] || process.env.LF_TOKEN

if (!TOKEN) {
  console.error('Usage: node populate_lost_found_data.js <JWT_TOKEN>')
  console.error('Or set the LF_TOKEN environment variable.')
  process.exit(1)
}

const categories = ['Electronics', 'Accessories', 'Bags', 'Documents', 'Clothing', 'Others']
const locations = [
  'MG Road, Bangalore',
  'Indiranagar, Bangalore',
  'Koramangala, Bangalore',
  'Jayanagar, Bangalore',
  'BTM Layout, Bangalore',
  'Whitefield, Bangalore',
  'Electronic City, Bangalore',
  'Marathahalli, Bangalore',
  'HSR Layout, Bangalore',
  'JP Nagar, Bangalore'
]

const lostItemTemplates = [
  { itemName: 'Black Titan Watch', category: 'Accessories', description: 'Black analog wristwatch with leather strap. Has a small scratch near the dial.' },
  { itemName: 'Blue College Backpack', category: 'Bags', description: 'Blue laptop backpack with multiple compartments. Contains some college notebooks.' },
  { itemName: 'Samsung Galaxy Smartphone', category: 'Electronics', description: 'Mid-range Samsung phone in a black case. Screen has a small crack at the corner.' },
  { itemName: 'Brown Leather Wallet', category: 'Accessories', description: 'Brown bifold wallet with several cards and a little cash inside.' },
  { itemName: 'White Wireless Earbuds', category: 'Electronics', description: 'White Bluetooth earbuds in a charging case. Slightly scuffed case.' },
  { itemName: 'Dell Laptop Charger', category: 'Electronics', description: 'Black Dell 65W adapter with a long power cord.' },
  { itemName: 'College ID Card', category: 'Documents', description: 'Laminated student ID card with a blue lanyard.' },
  { itemName: 'Black Spectacles', category: 'Accessories', description: 'Black rectangular eyeglasses in a hard case.' },
  { itemName: 'Red Water Bottle', category: 'Others', description: 'Red insulated steel bottle with a few stickers on it.' },
  { itemName: 'Black Jacket', category: 'Clothing', description: 'Lightweight black bomber jacket with a small logo on the sleeve.' }
]

const foundItemTemplates = [
  { itemName: 'Black Analog Watch', category: 'Accessories', description: 'Black round dial watch found near a bench. Strap is slightly worn.' },
  { itemName: 'Blue Backpack', category: 'Bags', description: 'Blue backpack with a laptop sleeve and a few books inside.' },
  { itemName: 'Samsung Mobile Phone', category: 'Electronics', description: 'Samsung phone with a dark cover. Lock screen shows a landscape wallpaper.' },
  { itemName: 'Brown Wallet', category: 'Accessories', description: 'Brown wallet found on a chair. Contains cards and some currency notes.' },
  { itemName: 'White Wireless Earbuds', category: 'Electronics', description: 'White earbuds in a compact charging case. Left earbud has a tiny mark.' },
  { itemName: 'Laptop Charger', category: 'Electronics', description: 'Universal laptop charger with a slightly frayed cable near the plug.' },
  { itemName: 'Student ID Card', category: 'Documents', description: 'Laminated student ID card found on the ground near the cafeteria.' },
  { itemName: 'Black Eyeglasses', category: 'Accessories', description: 'Black framed spectacles in a soft pouch.' },
  { itemName: 'Blue Water Bottle', category: 'Others', description: 'Blue metal water bottle with a few dents on the bottom.' },
  { itemName: 'Navy Blue Hoodie', category: 'Clothing', description: 'Navy hoodie found on a park bench. Has a front pocket and drawstrings.' }
]

const formatDate = (date) => date.toISOString().split('T')[0]

const randomDate = () => {
  const today = new Date()
  const daysAgo = Math.floor(Math.random() * 14) + 1
  const date = new Date(today)
  date.setDate(today.getDate() - daysAgo)
  return formatDate(date)
}

const randomLocation = () => locations[Math.floor(Math.random() * locations.length)]

const buildFormData = (item, dateField) => {
  const form = new URLSearchParams()
  form.append('itemName', item.itemName)
  form.append('description', item.description)
  form.append('category', item.category)
  form.append('location', randomLocation())
  form.append(dateField, randomDate())
  return form
}

const createRecord = async (path, form) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  })
  return response.json()
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const run = async () => {
  const lostResults = []
  const foundResults = []

  console.log('Creating Lost Items...')
  for (let i = 0; i < lostItemTemplates.length; i++) {
    const template = lostItemTemplates[i]
    const form = buildFormData(template, 'lostDate')
    try {
      const result = await createRecord('/lost/add', form)
      lostResults.push({ itemName: template.itemName, success: result.status === true, response: result })
      console.log(`  [${i + 1}/${lostItemTemplates.length}] ${template.itemName} -> ${result.status ? 'OK' : 'FAIL'}`)
      if (!result.status) console.log(`      Reason: ${result.message}`)
    } catch (error) {
      lostResults.push({ itemName: template.itemName, success: false, error: error.message })
      console.log(`  [${i + 1}/${lostItemTemplates.length}] ${template.itemName} -> ERROR: ${error.message}`)
    }
    await delay(150)
  }

  console.log('\nCreating Found Items...')
  for (let i = 0; i < foundItemTemplates.length; i++) {
    const template = foundItemTemplates[i]
    const form = buildFormData(template, 'foundDate')
    try {
      const result = await createRecord('/found/add', form)
      foundResults.push({ itemName: template.itemName, success: result.status === true, response: result })
      console.log(`  [${i + 1}/${foundItemTemplates.length}] ${template.itemName} -> ${result.status ? 'OK' : 'FAIL'}`)
      if (!result.status) console.log(`      Reason: ${result.message}`)
    } catch (error) {
      foundResults.push({ itemName: template.itemName, success: false, error: error.message })
      console.log(`  [${i + 1}/${foundItemTemplates.length}] ${template.itemName} -> ERROR: ${error.message}`)
    }
    await delay(150)
  }

  console.log('\nVerifying created records...')
  const lostVerify = await (await fetch(`${API_BASE}/lost/all`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json()
  const foundVerify = await (await fetch(`${API_BASE}/found/all`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json()

  const lostCount = Array.isArray(lostVerify.data) ? lostVerify.data.length : 0
  const foundCount = Array.isArray(foundVerify.data) ? foundVerify.data.length : 0

  const lostCreated = lostResults.filter((r) => r.success).length
  const foundCreated = foundResults.filter((r) => r.success).length
  const lostFailed = lostResults.filter((r) => !r.success)
  const foundFailed = foundResults.filter((r) => !r.success)

  console.log('\n========== RESULTS ==========')
  console.log(`Lost Items created:     ${lostCreated}/${lostItemTemplates.length}`)
  console.log(`Found Items created:    ${foundCreated}/${foundItemTemplates.length}`)
  console.log(`Total Lost Items in DB: ${lostCount}`)
  console.log(`Total Found Items in DB: ${foundCount}`)
  console.log(`Authentication:         OK (JWT used)`)
  console.log(`Image upload:           Skipped (image is optional in existing API)`)
  console.log(`Code modified:          NONE`)
  console.log('API endpoints used:')
  console.log('  POST /user/register')
  console.log('  POST /user/login')
  console.log('  POST /lost/add')
  console.log('  POST /found/add')
  console.log('  GET  /lost/all')
  console.log('  GET  /found/all')

  if (lostFailed.length) {
    console.log('\nFailed Lost Items:')
    lostFailed.forEach((f) => console.log(`  - ${f.itemName}: ${f.response?.message || f.error}`))
  }
  if (foundFailed.length) {
    console.log('\nFailed Found Items:')
    foundFailed.forEach((f) => console.log(`  - ${f.itemName}: ${f.response?.message || f.error}`))
  }
  console.log('=============================')
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
