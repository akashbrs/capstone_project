package com.bsctf.pos.controller;

import com.bsctf.pos.dto.AddItemsRequest;
import com.bsctf.pos.dto.CheckoutRequest;
import com.bsctf.pos.dto.CreateOrderRequest;
import com.bsctf.pos.entity.Order;
import com.bsctf.pos.entity.OrderStatus;
import com.bsctf.pos.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getOrders(@RequestParam(required = false) String range) {
        if ("today".equals(range)) {
            LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            return orderService.getOrdersBetween(start, end);
        }
        return orderService.getAllOrders();
    }

    @GetMapping("/active")
    public List<Order> getActiveOrders() {
        return orderService.getActiveOrders();
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrderOrThrow(id);
    }

    @PostMapping
    public Order createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        String createdBy = authentication != null ? authentication.getName() : "unknown";
        return orderService.createOrder(request, createdBy);
    }

    @PostMapping("/{id}/items")
    public Order addItems(@PathVariable Long id, @Valid @RequestBody AddItemsRequest request) {
        return orderService.addItems(id, request);
    }

    @DeleteMapping("/{orderId}/items/{itemId}")
    public Order removeItem(@PathVariable Long orderId, @PathVariable Long itemId) {
        return orderService.removeItem(orderId, itemId);
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return orderService.updateStatus(id, OrderStatus.valueOf(body.get("status")));
    }

    @PostMapping("/{id}/checkout")
    public Order checkout(@PathVariable Long id, @Valid @RequestBody CheckoutRequest request) {
        return orderService.checkout(id, request);
    }

    @PostMapping("/{id}/cancel")
    public Order cancel(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}
