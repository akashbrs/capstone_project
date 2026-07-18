package com.bsctf.pos.dto;

import com.bsctf.pos.entity.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableDto {
    private Long id;

    @NotNull(message = "Table number is required")
    private Integer tableNumber;

    private Integer capacity;
    private TableStatus status;
}
