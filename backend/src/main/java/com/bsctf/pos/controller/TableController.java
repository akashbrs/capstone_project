package com.bsctf.pos.controller;

import com.bsctf.pos.dto.TableDto;
import com.bsctf.pos.entity.TableStatus;
import com.bsctf.pos.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public List<TableDto> getAll() {
        return tableService.getAll();
    }

    @PostMapping
    public TableDto create(@Valid @RequestBody TableDto dto) {
        return tableService.create(dto);
    }

    @PatchMapping("/{id}/status")
    public TableDto updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return tableService.updateStatus(id, TableStatus.valueOf(body.get("status")));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tableService.delete(id);
    }
}
