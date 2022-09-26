INSERT INTO class_roles (name, description, viewRoster, editRoster, changeRoles, viewRosterObservations, acceptRejectRosterObservations, deleteClass)
VALUES ("Student", "A student may only access their own observations, and cannot see other members of the class or their observations.", 0,0,0,0,0,0);

INSERT INTO class_roles (name, description,viewRoster, editRoster, changeRoles, viewRosterObservations, acceptRejectRosterObservations, deleteClass)
VALUES ("Grader / Observer","A grader or observer can see all members of the class and their observations, but cannot modify the roster or accept/reject observations",1,0,0,1,0,0);
	
INSERT INTO class_roles (name, description, viewRoster, editRoster, changeRoles, viewRosterObservations, acceptRejectRosterObservations, deleteClass)
VALUES ("Teaching Assistant","A TA can see and edit the roster, view and accept or reject observations from members of the class", 1,1,0, 1,1,0);

INSERT INTO class_roles (name, description, viewRoster, editRoster, changeRoles, viewRosterObservations, acceptRejectRosterObservations, deleteClass)
VALUES ("Co-Instructor","A Co-Instructor can see and edit the roster, change roles of class members, and view and accept or reject observations from members of the class", 1,1,1,1,1,0);

INSERT INTO class_roles (name, description, viewRoster, editRoster, changeRoles, viewRosterObservations, acceptRejectRosterObservations, deleteClass)
VALUES ("Instructor","An instructor can view and edit the roster, change roles of class members, view and accept or reject observations from members of the class, and delete the class.", 1,1,1,1,1,1);

