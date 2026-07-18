package com.bsctf.pos.service;

import com.bsctf.pos.dto.*;
import com.bsctf.pos.entity.*;
import com.bsctf.pos.exception.BadRequestException;
import com.bsctf.pos.exception.ResourceNotFoundException;
import com.bsctf.pos.repository.MenuItemRepository;
import com.bsctf.pos.repository.OrderRepository;
import com.bsctf.pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% GST-style flat tax
    private static final AtomicInteger SEQUENCE = new AtomicInteger((int)(System.currentTimeMillis() % 10000));

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request, String createdBy) {
        RestaurantTable table = null;
        if (request.getOrderType() == OrderType.DINE_IN) {
            if (request.getTableId() == null) {
                throw new BadRequestException("Table is required for dine-in orders");
            }
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + request.getTableId()));
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .table(table)
                .orderType(request.getOrderType())
                .status(OrderStatus.OPEN)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .createdBy(createdBy)
                .build();

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
                throw new BadRequestException("'" + menuItem.getName() + "' is currently unavailable");
            }

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .notes(itemReq.getNotes())
                    .build();
            order.addItem(orderItem);
        }

        recalculateTotals(order);

        if (table != null) {
            table.setStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order addItems(Long orderId, AddItemsRequest request) {
        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify an order that is already " + order.getStatus());
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemReq.getMenuItemId()));

            if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
                throw new BadRequestException("'" + menuItem.getName() + "' is currently unavailable");
            }

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .notes(itemReq.getNotes())
                    .build();
            order.addItem(orderItem);
        }

        recalculateTotals(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order removeItem(Long orderId, Long orderItemId) {
        Order order = getOrderOrThrow(orderId);
        boolean removed = order.getItems().removeIf(i -> i.getId().equals(orderItemId));
        if (!removed) {
            throw new ResourceNotFoundException("Order item not found: " + orderItemId);
        }
        recalculateTotals(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = getOrderOrThrow(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order checkout(Long orderId, CheckoutRequest request) {
        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.PAID) {
            throw new BadRequestException("Order is already paid");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot checkout a cancelled order");
        }

        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }
        recalculateTotals(order);

        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.NEEDS_CLEANING);
            tableRepository.save(table);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrderOrThrow(orderId);
        if (order.getStatus() == OrderStatus.PAID) {
            throw new BadRequestException("Cannot cancel a paid order");
        }
        order.setStatus(OrderStatus.CANCELLED);

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        return orderRepository.save(order);
    }

    public Order getOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusNotOrderByCreatedAtDesc(OrderStatus.PAID);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersBetween(LocalDateTime start, LocalDateTime end) {
        return orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
    }

    private void recalculateTotals(Order order) {
        BigDecimal subtotal = order.getItems().stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = order.getDiscountAmount() == null ? BigDecimal.ZERO : order.getDiscountAmount();
        if (discount.compareTo(subtotal) > 0) {
            throw new BadRequestException("Discount cannot exceed subtotal");
        }

        BigDecimal taxable = subtotal.subtract(discount);
        BigDecimal tax = taxable.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax);

        order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setTaxAmount(tax);
        order.setDiscountAmount(discount.setScale(2, RoundingMode.HALF_UP));
        order.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
    }

    private synchronized String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        int seq = SEQUENCE.getAndIncrement();
        return "ORD-" + datePart + "-" + String.format("%04d", seq);
    }
}
