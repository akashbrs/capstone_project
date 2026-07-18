package com.bsctf.pos.controller;

import com.bsctf.pos.dto.MenuItemDto;
import com.bsctf.pos.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public List<MenuItemDto> getAll(@RequestParam(required = false) Long categoryId) {
        return categoryId != null ? menuItemService.getByCategory(categoryId) : menuItemService.getAll();
    }

    @PostMapping
    public MenuItemDto create(@Valid @RequestBody MenuItemDto dto) {
        return menuItemService.create(dto);
    }

    @PutMapping("/{id}")
    public MenuItemDto update(@PathVariable Long id, @Valid @RequestBody MenuItemDto dto) {
        return menuItemService.update(id, dto);
    }

    @PatchMapping("/{id}/toggle-availability")
    public MenuItemDto toggleAvailability(@PathVariable Long id) {
        return menuItemService.toggleAvailability(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        menuItemService.delete(id);
    }
}
