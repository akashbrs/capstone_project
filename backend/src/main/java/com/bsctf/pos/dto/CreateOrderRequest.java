package com.bsctf.pos.dto;

import com.bsctf.pos.entity.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private Long tableId;

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    private String customerName;
    private String customerPhone;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;
}
