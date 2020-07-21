INSERT INTO permissions (name, administrator, instructor, researcher) 
VALUES ("administrator", 1, 0, 0);

INSERT INTO permissions (name, administrator, instructor, researcher) 
VALUES ("user", 0, 0, 0);

INSERT INTO permissions (name, administrator, instructor, researcher) 
VALUES ("instructor", 0, 1, 0);


INSERT INTO permissions (name, administrator, instructor, researcher) 
VALUES ("instructor/researcher", 0, 1, 1);

INSERT INTO permissions (name, administrator, instructor, researcher) 
VALUES ("researcher", 0, 0, 1);

