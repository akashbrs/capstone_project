package com.bsctf.pos.service;

import com.bsctf.pos.dto.TableDto;
import com.bsctf.pos.entity.RestaurantTable;
import com.bsctf.pos.entity.TableStatus;
import com.bsctf.pos.exception.BadRequestException;
import com.bsctf.pos.exception.ResourceNotFoundException;
import com.bsctf.pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository tableRepository;

    public List<TableDto> getAll() {
        return tableRepository.findAll().stream()
                .sorted((a, b) -> a.getTableNumber().compareTo(b.getTableNumber()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TableDto create(TableDto dto) {
        if (tableRepository.existsByTableNumber(dto.getTableNumber())) {
            throw new BadRequestException("Table " + dto.getTableNumber() + " already exists");
        }
        RestaurantTable table = RestaurantTable.builder()
                .tableNumber(dto.getTableNumber())
                .capacity(dto.getCapacity() == null ? 4 : dto.getCapacity())
                .status(TableStatus.AVAILABLE)
                .build();
        return toDto(tableRepository.save(table));
    }

    public TableDto updateStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + id));
        table.setStatus(status);
        return toDto(tableRepository.save(table));
    }

    public void delete(Long id) {
        if (!tableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Table not found: " + id);
        }
        tableRepository.deleteById(id);
    }

    private TableDto toDto(RestaurantTable table) {
        TableDto dto = new TableDto();
        dto.setId(table.getId());
        dto.setTableNumber(table.getTableNumber());
        dto.setCapacity(table.getCapacity());
        dto.setStatus(table.getStatus());
        return dto;
    }
}
