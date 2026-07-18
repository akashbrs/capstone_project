package com.bsctf.pos.config;

import com.bsctf.pos.entity.*;
import com.bsctf.pos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedMenu();
        seedTables();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        userRepository.save(User.builder()
                .username("admin")
                .fullName("Restaurant Admin")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .enabled(true)
                .build());

        userRepository.save(User.builder()
                .username("cashier")
                .fullName("Front Desk Cashier")
                .password(passwordEncoder.encode("cashier123"))
                .role(Role.CASHIER)
                .enabled(true)
                .build());
    }

    private void seedMenu() {
        if (categoryRepository.count() > 0) return;

        Category starters = categoryRepository.save(Category.builder().name("Starters").displayOrder(1).build());
        Category mains = categoryRepository.save(Category.builder().name("Main Course").displayOrder(2).build());
        Category beverages = categoryRepository.save(Category.builder().name("Beverages").displayOrder(3).build());
        Category desserts = categoryRepository.save(Category.builder().name("Desserts").displayOrder(4).build());

        menuItemRepository.save(MenuItem.builder().name("Paneer Tikka").description("Grilled cottage cheese skewers").price(new BigDecimal("220.00")).category(starters).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Chicken 65").description("Spicy fried chicken bites").price(new BigDecimal("260.00")).category(starters).isVeg(false).build());
        menuItemRepository.save(MenuItem.builder().name("Crispy Corn").description("Fried corn kernels tossed in spices").price(new BigDecimal("180.00")).category(starters).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Butter Chicken").description("Creamy tomato chicken curry").price(new BigDecimal("340.00")).category(mains).isVeg(false).build());
        menuItemRepository.save(MenuItem.builder().name("Paneer Butter Masala").description("Cottage cheese in rich gravy").price(new BigDecimal("300.00")).category(mains).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Veg Biryani").description("Fragrant basmati rice with vegetables").price(new BigDecimal("240.00")).category(mains).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Garlic Naan").description("Indian flatbread baked with garlic").price(new BigDecimal("60.00")).category(mains).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Masala Chai").description("Spiced Indian tea").price(new BigDecimal("40.00")).category(beverages).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Fresh Lime Soda").description("Sweet or salted").price(new BigDecimal("70.00")).category(beverages).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Cold Coffee").description("Chilled coffee blended with ice cream").price(new BigDecimal("120.00")).category(beverages).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Gulab Jamun").description("Two pieces, warm syrup").price(new BigDecimal("90.00")).category(desserts).isVeg(true).build());
        menuItemRepository.save(MenuItem.builder().name("Sizzling Brownie").description("Warm brownie with ice cream").price(new BigDecimal("150.00")).category(desserts).isVeg(true).build());
    }

    private void seedTables() {
        if (tableRepository.count() > 0) return;
        for (int i = 1; i <= 10; i++) {
            tableRepository.save(RestaurantTable.builder()
                    .tableNumber(i)
                    .capacity(i % 3 == 0 ? 6 : 4)
                    .status(TableStatus.AVAILABLE)
                    .build());
        }
    }
}
