package com.lostfound.found_item_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "found_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;

    private String description;

    private String category;

    private String location;

    private LocalDate foundDate;

    private String status;

    private Long userId;

    private String imageUrl;
    private String imagePublicId;
}