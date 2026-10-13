package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.taskboard.entity.TaskList;

// lists テーブルを読み書きする窓口（中身は Spring Data JPA が自動で作る）
public interface TaskListRepository extends JpaRepository<TaskList, Long> {

	// すべてのリストを並び順（position の小さい順）で取得する
	List<TaskList> findAllByOrderByPositionAsc();

	// いちばん大きい position を調べる（リストが1つもないときは -1）
	@Query("select coalesce(max(l.position), -1) from TaskList l")
	int findMaxPosition();
}
