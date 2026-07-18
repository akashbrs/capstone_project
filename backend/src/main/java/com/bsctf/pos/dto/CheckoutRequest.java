package com.bsctf.pos.dto;

import com.bsctf.pos.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private BigDecimal discountAmount;
}
