export const User = {
    __resolveType: (user) => user.qualificationCompletion ? "Student" : "Teacher"
};
