CREATE TABLE user(
	username VARCHAR(50),
    secret VARCHAR(50) UNIQUE,
    PRIMARY KEY (username)
);
CREATE TABLE notes(
    note_id INT AUTO_INCREMENT,
    username VARCHAR(50),
    title VARCHAR(20) UNIQUE,
    note VARCHAR(1000),
    PRIMARY KEY (note_id),
    FOREIGN KEY (username) REFERENCES user(username)
);

DESCRIBE user;
DROP TABLE user;
SELECT * FROM user;

DESCRIBE notes;
DROP TABLE notes;
SELECT * FROM notes;

INSERT INTO notes VALUES(1,'User1','NAME','MY ANME IS ABHISHEK'); 
INSERT INTO notes VALUES(2,'User2','AGE','MY ANME IS UGALE');

DELETE FROM notes WHERE username = 'User1';
DELETE FROM user WHERE username = 'User2';
