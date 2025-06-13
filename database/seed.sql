INSERT INTO users (username, name, roll_number, email)
VALUES ('johndoe', 'John Doe', '123456', 'john.doe@email.com');

INSERT INTO profiles (user_id, public_data, protected_data, public_url, protected_url)
VALUES (
    1,
    '{"name": "John Doe", "role": "Student", "bio": "Loves AI & Robotics"}',
    '{"address": "123 Secret St", "phone": "9876543210"}',
    '/profile/johndoe',
    '/profile/johndoe/protected?token=abc123'
);
