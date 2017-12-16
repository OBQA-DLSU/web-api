const invitationCode = require('../constants/invitationCode');
module.exports = {
  readCode: (code) => {
    switch (code) {
      case invitationCode.CHE_COORDINATOR: return {programId: 1, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.CHE_FACULTY: return {programId: 1, roleId: 2, isAdmin: false, isStudent: false };
      case invitationCode.CHE_STUDENT: return {program: 1, roleId: 2, isAdmin: false, isStudent: true };
      case invitationCode.CE_COORDINATOR: return {programId: 2, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.CE_FACULTY: return {programId: 2, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.CE_STUDENT: return {program: 2, roleId: 2, isAdmin: false, isStudent: true  };
      case invitationCode.CPE_COORDINATOR: return {programId: 3, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.CPE_FACULTY: return {programId: 3, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.CPE_STUDENT: return {program: 3, roleId: 2, isAdmin: false, isStudent: true  };
      case invitationCode.ECE_COORDINATOR: return {programId: 4, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.ECE_FACULTY: return {programId: 4, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.ECE_STUDENT: return {program: 1, roleId: 2, isAdmin: false, isStudent: true  };
      case invitationCode.IE_COORDINATOR: return {programId: 5, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.IE_FACULTY: return {programId: 5, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.IE_STUDENT: return {program: 5, roleId: 2, isAdmin: false, isStudent: true  };
      case invitationCode.MEM_COORDINATOR: return {programId: 6, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.MEM_FACULTY: return {programId: 6, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.MEM_STUDENT: return {program: 6, roleId: 2, isAdmin: false, isStudent: true  };
      case invitationCode.ME_COORDINATOR: return {programId: 7, roleId: 2, isAdmin: true, isStudent: false };
      case invitationCode.ME_FACULTY: return {programId: 7, roleId: 2, isAdmin: false, isStudent: false};
      case invitationCode.ME_STUDENT: return {program: 1, roleId: 2, isAdmin: false, isStudent: true  };
      default: return null;
    }
  },
  convertToCode: (program, roleId, isAdmin, isStudent) => {
    switch (JSON.parse(isStudent)) {
      case false: 
        switch(JSON.parse(isAdmin)) {
          case true:
            switch(program) {
              case 1: return invitationCode.CHE_COORDINATOR;
              case 2: return invitationCode.CE_COORDINATOR;
              case 3: return invitationCode.CPE_COORDINATOR;
              case 4: return invitationCode.ECE_COORDINATOR;
              case 5: return invitationCode.IE_COORDINATOR;
              case 6: return invitationCode.MEM_COORDINATOR;
              case 7: return invitationCode.ME_COORDINATOR;
            }
          case false:
            switch(program) {
              case 1: return invitationCode.CHE_FACULTY;
              case 2: return invitationCode.CE_FACULTY;
              case 3: return invitationCode.CPE_FACULTY;
              case 4: return invitationCode.ECE_FACULTY;
              case 5: return invitationCode.IE_FACULTY;
              case 6: return invitationCode.MEM_FACULTY;
              case 7: return invitationCode.ME_FACULTY;
            }
        }
      case true:
        switch(program) {
          case 1: return invitationCode.CHE_STUDENT;
          case 2: return invitationCode.CE_STUDENT;
          case 3: return invitationCode.CPE_STUDENT;
          case 4: return invitationCode.ECE_STUDENT;
          case 5: return invitationCode.IE_STUDENT;
          case 6: return invitationCode.MEM_STUDENT;
          case 7: return invitationCode.ME_STUDENT;
        }
      default: null;
    }
  }
}
