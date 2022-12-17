INSERT INTO department (department_name)
VALUES ("Engineering"),
       ("Finance"),
       ("Sales"),
       ("Legal");
 
INSERT INTO role (department_id, title, salary)
VALUES (1,"Lead Engineer", 205000),
       (1,"Software Engineer", 125000),
       (2,"Account Manager", 260000),
       (2,"Accountant", 105000),
       (3,"Sales Manager", 220000),
       (3,"Salesperson", 80000),
       (4,"Legal Team Lead", 208000),
       (4,"Lawyer", 105000);

INSERT INTO employee (role_id, first_name,last_name, manager_id)
VALUES (1,"Risvi", "Tareq",null),
       (2,"Nathan", "Chen", 1),
       (3,"Rasheem", "Tareq",null),
       (4,"Reeanna", "Tareq", 3),
       (5,"Cody","Lemont",null),
       (6,"Max","Blunt",5),
       (7,"Danyal", "Ahmed",null),
       (8,"Hailey","Baltazar",7);
