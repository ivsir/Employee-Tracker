const inquirer = require("inquirer");
// Import and require mysql2
const mysql = require("mysql2");
require("console.table");
// Connect to database
const departmentsList = [];
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
    let deptNamesArray = [];
    rows.forEach((department) => {
      deptNamesArray.push(department.department_name);
    });
    deptNamesArray.push("Create Department");
    const deptQuestion = [
      {
        type: "list",
        message: "Which department would you like to add a role to?",
        name: "roleDepartment",
        choices: deptNamesArray,
      },
    ];
    inquirer.prompt(deptQuestion).then((answers) => {
      if (answers.roleDepartment === "Create Department") {
        addDepartment();
      } else {
        roleInfo(answers);
      }
    });
    const roleInfo = (chosenDepartment) => {
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
      inquirer.prompt(roleQuestion).then((answers) => {
        let departmentId;
        rows.forEach((department) => {
          if (chosenDepartment.roleDepartment === department.department_name) {
            departmentId = department.id;
          }
        });
        const sql = `
        INSERT INTO role (department_id, title, salary)
        VALUES (?,?,?)
        `;
        db.query(
          sql,
          [departmentId, answers.roleTitle, answers.roleSalary],
          (err, rows) => {
            if (err) throw err;
            viewRoles();
          }
        );
      });
    };
  });
};

const addEmployee = () => {
  db.query(selectRole, (err, rows) => {
    let roleArray = [];
    rows.forEach((role) => {
      roleArray.push({
        name: role.title,
        value: role.role_id,
      });
    });
    roleArray.push("Create a new role");

    const employeeRoleQuestion = [
      {
        type: "list",
        message: "What is the employee's role?",
        name: "employeeRole",
        choices: roleArray,
      },
    ];

    inquirer.prompt(employeeRoleQuestion).then((answer) => {
      if (answer.employeeRole === "Create a new role") {
        addRole();
      } else {
        employeeInfo(answer);
      }
    });

    const employeeInfo = (answer) => {
      let managersArray = [];
      db.query(selectEmployee, (err, rows) => {
        rows.forEach((employee) => {
          managersArray.push({
            name: employee.first_name + " " + employee.last_name,
            value: employee.employee_id,
          });
        });
      });

      const employeeQuestions = [
        {
          type: "input",
          message: "What is the employee's first name?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the employee's last name?",
          name: "lastName",
        },
        {
          type: "list",
          message: "Who is the employee's manager?",
          name: "employeeManager",
          choices: managersArray,
        },
      ];

      inquirer.prompt(employeeQuestions).then((answers) => {
        const sql = `INSERT INTO employee (role_id, first_name, last_name, manager_id)
      VALUES (?,?,?,?)`;
        db.query(
          sql,
          [
            answer.employeeRole,
            answers.firstName,
            answers.lastName,
            answers.employeeManager,
          ],
          (err, rows) => {
            if (err) throw err;
            viewEmployees();
          }
        );
      });
    };
  });
};

const updateEmployeeRole = () => {
  db.query(selectEmployee, (err, rows) => {
    if (err) throw error;
    let employeeNames = [];
    rows.forEach((employee) => {
      employeeNames.push({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.employee_id,
      });
    });

    let employeeRoles = [];
    rows.forEach((role) => {
      employeeRoles.push({
        name: role.title,
        value: role.employee_id,
      });
    });

    const updateEmployee = [
      {
        type: "list",
        message: "Which employee's role do you want to update?",
        name: "updateEmployee",
        choices: employeeNames,
      },
      {
        type: "list",
        message: "Which role do you want to assign to the selected employee?",
        name: "updateRole",
        choices: employeeRoles,
      },
    ];

    inquirer.prompt(updateEmployee).then((answers) => {
      sql = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
      db.query(
        sql,
        [answers.updateRole, answers.updateEmployee],
        (err, rows) => {
          if (err) throw err;
          viewEmployees();
        }
      );
    });
  });
};
