package com.bsctf.pos.repository;

import com.bsctf.pos.entity.Order;
import com.bsctf.pos.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByStatusNotOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    List<Order> findByTableIdAndStatusNot(Long tableId, OrderStatus status);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
