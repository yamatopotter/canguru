-- Cria o usuário administrador padrão direto na migration, em vez de
-- depender de ADMIN_USERNAME/ADMIN_PASSWORD no .env: usuário "admin",
-- senha "admin" (hash bcrypt, 12 rounds), com troca de senha obrigatória
-- no primeiro login.
--
-- "INSERT OR IGNORE" evita erro ou duplicata em bancos que já tinham um
-- usuário "admin" criado pelo seed antigo baseado em variáveis de
-- ambiente — o "username" é UNIQUE, então o insert é simplesmente
-- ignorado nesse caso.
INSERT OR IGNORE INTO "User" ("id", "name", "username", "passwordHash", "role", "active", "mustChangePassword", "updatedAt")
VALUES ('default-admin', 'Administrador', 'admin', '$2a$12$FGJwE6blIXrYPcrKfonl2ulZyMn50uo9/OY8pvk5nAiaNc5VB4m/y', 'ADMIN', true, true, CURRENT_TIMESTAMP);
