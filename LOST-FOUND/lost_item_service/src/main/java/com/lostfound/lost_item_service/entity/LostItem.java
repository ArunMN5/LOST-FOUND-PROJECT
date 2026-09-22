package com.lostfound.lost_item_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "lost_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;

    private String description;

    private String category;

    private String location;

    private LocalDate lostDate;

    private String status;

    private Long userId;


    private String imageUrl;

    private String imagePublicId;
}

