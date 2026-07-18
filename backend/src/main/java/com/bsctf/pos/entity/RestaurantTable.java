package com.bsctf.pos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    private Integer tableNumber;

    @Builder.Default
    private Integer capacity = 4;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private TableStatus status = TableStatus.AVAILABLE;
}
