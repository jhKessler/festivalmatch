.PHONY: backend frontend prod db


backend:
	cd backend && python main.py

db:
	docker compose up -d festival_db

frontend:
	cd frontend && npm run dev

prod:
	docker compose down --remove-orphans
	docker compose build
	docker image prune -f
	docker compose up -d

