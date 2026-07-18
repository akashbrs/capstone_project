package com.bsctf.pos.service;

import com.bsctf.pos.dto.MenuItemDto;
import com.bsctf.pos.entity.Category;
import com.bsctf.pos.entity.MenuItem;
import com.bsctf.pos.exception.ResourceNotFoundException;
import com.bsctf.pos.repository.CategoryRepository;
import com.bsctf.pos.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public List<MenuItemDto> getAll() {
        return menuItemRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MenuItemDto> getByCategory(Long categoryId) {
        return menuItemRepository.findByCategoryId(categoryId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public MenuItemDto create(MenuItemDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.getCategoryId()));

        MenuItem item = MenuItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .isAvailable(dto.getIsAvailable() == null || dto.getIsAvailable())
                .isVeg(dto.getIsVeg() == null || dto.getIsVeg())
                .category(category)
                .build();

        return toDto(menuItemRepository.save(item));
    }

    public MenuItemDto update(Long id, MenuItemDto dto) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.getCategoryId()));
            item.setCategory(category);
        }

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        if (dto.getImageUrl() != null) item.setImageUrl(dto.getImageUrl());
        if (dto.getIsAvailable() != null) item.setIsAvailable(dto.getIsAvailable());
        if (dto.getIsVeg() != null) item.setIsVeg(dto.getIsVeg());

        return toDto(menuItemRepository.save(item));
    }

    public void delete(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    public MenuItemDto toggleAvailability(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
        item.setIsAvailable(!item.getIsAvailable());
        return toDto(menuItemRepository.save(item));
    }

    private MenuItemDto toDto(MenuItem item) {
        MenuItemDto dto = new MenuItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setIsAvailable(item.getIsAvailable());
        dto.setIsVeg(item.getIsVeg());
        dto.setCategoryId(item.getCategory().getId());
        dto.setCategoryName(item.getCategory().getName());
        return dto;
    }
}
