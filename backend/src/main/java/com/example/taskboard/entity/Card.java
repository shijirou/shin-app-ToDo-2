package com.example.taskboard.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// cards テーブル（カード＝タスク）に対応するクラス
@Entity
@Table(name = "cards")
public class Card {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// 所属するリスト。リストを削除すると、カードもデータベース側で一緒に削除される
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "list_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private TaskList list;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

	// 重要度。DB 側にも初期値 'MEDIUM' を付けておくので、この列を足す前からあるカードは「中」になる
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, columnDefinition = "VARCHAR(10) DEFAULT 'MEDIUM'")
	private Priority priority = Priority.MEDIUM;

	@Column(nullable = false)
	private Integer position;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	protected Card() {
	}

	public Card(TaskList list, String content, Priority priority, Integer position) {
		this.list = list;
		this.content = content;
		this.priority = priority;
		this.position = position;
	}

	// カードの内容を変える
	public void updateContent(String content) {
		this.content = content;
	}

	// 重要度を変える
	public void changePriority(Priority priority) {
		this.priority = priority;
	}

	// カードを別のリストに移す
	public void moveTo(TaskList list) {
		this.list = list;
	}

	// リスト内の並び順を変える
	public void changePosition(Integer position) {
		this.position = position;
	}

	public Long getId() {
		return id;
	}

	public TaskList getList() {
		return list;
	}

	public String getContent() {
		return content;
	}

	public Priority getPriority() {
		return priority;
	}

	public Integer getPosition() {
		return position;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
