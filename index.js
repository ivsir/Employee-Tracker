const inquirer = require("inquirer");
// Import and require mysql2
const mysql = require("mysql2");
require("console.table");
// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // TODO: Add MySQL password here
    password: "rootroot",
    database: "departments_db",
  },
  console.log(`Connected to the departments_db database.`)
);

db.connect(() => {
  inquirerQuestions();
});

const selectDepartment = `SELECT * FROM department`;

const selectRole = `
SELECT 
  role.id AS role_id,
  role.title,
  department.department_name AS department,
  role.salary
FROM
  role
RIGHT JOIN
  department on role.department_id = department.id;
`;

const selectEmployee = `
SELECT
  employee.id AS employee_id,
  employee.first_name,
  employee.last_name,
  role.title,
  department.department_name AS department,
  role.salary,
  CONCAT(manager.first_name, ' ', manager.last_name) AS manager
FROM
  employee
LEFT JOIN
  role ON employee.role_id = role.id
LEFT JOIN
  department on role.department_id = department.id
LEFT JOIN
  employee manager on manager.id = employee.manager_id;
`;

const viewDepartments = () => {
  db.query(selectDepartment, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    for (let i = 0; i < rows.length; i++) {
      let departmentNames = rows[i].department_name;
      console.log(departmentNames);
    }
    inquirerQuestions();
  });
};

const viewRoles = () => {
  db.query(selectRole, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    inquirerQuestions();
  });
};

const viewEmployees = () => {
  db.query(selectEmployee, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    inquirerQuestions();
  });
};

const addDepartment = () => {
  const departmentQuestion = [
    {
      type: "input",
      message: "What department would you like to add?",
      name: "departmentAdd",
    },
  ];
  inquirer.prompt(departmentQuestion).then((answers) => {
    const sql = `
    INSERT INTO department (department_name)
    VALUES (?)
    `;

    db.query(sql, [answers.departmentAdd], (err, rows) => {
      if (err) throw err;
      viewDepartments();
    });
  });
};

const addRole = () => {
  db.query(selectDepartment, (err, rows) => {
    for (var i = 0; i < rows.length; i++) {
      var departmentNames = rows[i].department_name;
      console.log(departmentNames);
      return departmentNames;
    }
    const deptQuestion = [
      {
        type: "list",
        message: "Which department would you like to add a role to?",
        name: "roleDepartment",
        choices: `${departmentNames}`,
      },
    ];
    roleInfo();
    const roleInfo = () => {
      const roleQuestion = [
        {
          type: "input",
          message: "What role would you like to add?",
          name: "roleTitle",
        },
        {
          type: "input",
          message: "What is this role's salary?",
          name: "roleSalary",
        },
      ];
      inquirer.prompt(deptQuestion, roleQuestion).then((answers) => {
        const sql = `
        INSERT INTO role (department_id, title, salary)
        VALUES (?)
        `;
        db.query(
          sql,
          [answers.roleDepartment, answers.roleTitle, answers.roleSalary],
          (err, rows) => {
            viewRoles();
          }
        );
      });
    };
  });
};

const addEmployee = () => {};

const updateEmployeeRole = () => {};

const inquirerQuestions = () => {
  const questions = [
    {
      type: "list",
      message: "what would you like to do?",
      name: "promptChoices",
      choices: [
        "view all departments",
        "view all roles",
        "view all employees",
        "add a department",
        "add a role",
        "add an employee",
        "update an employee role",
      ],
    },
  ];
  inquirer.prompt(questions).then((answers) => {
    if (answers.promptChoices === "view all departments") {
      viewDepartments();
    }
    if (answers.promptChoices === "view all roles") {
      viewRoles();
    }
    if (answers.promptChoices === "view all employees") {
      viewEmployees();
    }
    if (answers.promptChoices === "add a department") {
      addDepartment();
    }
    if (answers.promptChoices === "add a role") {
      addRole();
    }
    if (answers.promptChoices === "add an employee") {
      addEmployee();
    }
    if (answers.promptChoices === "update an employee role") {
      updateEmployeeRole();
    }
  });
};

// // Read all departments
// app.get('/api/department', (req, res) => {
//   const sql = `SELECT
//   employee.id,
//   employee.first_name,
//   employee.last_name,
//   role.title,
//   department.department_name AS department,
//   role.salary,
//   CONCAT(manager.first_name, ' ', manager.last_name) AS manager
// FROM
//   employee
// LEFT JOIN
//   role ON employee.role_id = role.id
// LEFT JOIN
//   department on role.department_id = department.id
// LEFT JOIN
//   employee manager on manager.id = employee.manager_id;`;

//   db.query(sql, (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//        return;
//     }
//     res.json({
//       message: 'success',
//       data: rows
//     });
//   });
// });

// // Create a movie
// app.post('/api/new-department', ({ body }, res) => {
//   const sql = `INSERT INTO role (department_id, title, salary)
//     VALUES (?)`;
//   const params = [body.movie_name];

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json({
//       message: 'success',
//       data: body
//     });
//   });
// });

// Delete a movie
// app.delete('/api/movie/:id', (req, res) => {
//   const sql = `DELETE FROM movies WHERE id = ?`;
//   const params = [req.params.id];

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.statusMessage(400).json({ error: res.message });
//     } else if (!result.affectedRows) {
//       res.json({
//       message: 'Movie not found'
//       });
//     } else {
//       res.json({
//         message: 'deleted',
//         changes: result.affectedRows,
//         id: req.params.id
//       });
//     }
//   });
// });

// Read list of all reviews and associated movie name using LEFT JOIN
// app.get('/api/movie-reviews', (req, res) => {
//   const sql = `SELECT movies.movie_name AS movie, reviews.review FROM reviews LEFT JOIN movies ON reviews.movie_id = movies.id ORDER BY movies.movie_name;`;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({
//       message: 'success',
//       data: rows
//     });
//   });
// });

// BONUS: Update review name
// app.put('/api/review/:id', (req, res) => {
//   const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
//   const params = [req.body.review, req.params.id];

//   db.query(sql, params, (err, result) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//     } else if (!result.affectedRows) {
//       res.json({
//         message: 'Movie not found'
//       });
//     } else {
//       res.json({
//         message: 'success',
//         data: req.body,
//         changes: result.affectedRows
//       });
//     }
//   });
// });
