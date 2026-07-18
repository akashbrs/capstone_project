package com.bsctf.pos.controller;

import com.bsctf.pos.entity.Order;
import com.bsctf.pos.entity.OrderStatus;
import com.bsctf.pos.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderService orderService;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        List<Order> todayOrders = orderService.getOrdersBetween(start, end);

        List<Order> paidToday = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .toList();

        BigDecimal revenue = paidToday.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeOrders = todayOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.PAID && o.getStatus() != OrderStatus.CANCELLED)
                .count();

        return Map.of(
                "todayOrderCount", todayOrders.size(),
                "todayRevenue", revenue,
                "paidOrderCount", paidToday.size(),
                "activeOrderCount", activeOrders
        );
    }
}
