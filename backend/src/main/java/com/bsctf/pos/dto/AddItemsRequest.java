package com.bsctf.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AddItemsRequest {
    @NotEmpty(message = "Provide at least one item")
    @Valid
    private List<OrderItemRequest> items;
}
