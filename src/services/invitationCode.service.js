
const invitationCode = require('../constants/invitationCode');
module.exports = {
  readCode: (code) => {
    switch (code) {
      case invitationCode.CHE_COORDINATOR: return {programId: 1, roleId: 2};
      case invitationCode.CHE_FACULTY: return {programId: 1, roleId: 3};
      case invitationCode.CE_COORDINATOR: return {programId: 2, roleId: 2};
      case invitationCode.CE_FACULTY: return {programId: 2, roleId: 3};
      case invitationCode.CPE_COORDINATOR: return {programId: 3, roleId: 2};
      case invitationCode.CPE_FACULTY: return {programId: 3, roleId: 3};
      case invitationCode.ECE_COORDINATOR: return {programId: 4, roleId: 2};
      case invitationCode.ECE_FACULTY: return {programId: 4, roleId: 3};
      case invitationCode.IE_COORDINATOR: return {programId: 5, roleId: 2};
      case invitationCode.IE_FACULTY: return {programId: 5, roleId: 3};
      case invitationCode.MEM_COORDINATOR: return {programId: 6, roleId: 2};
      case invitationCode.MEM_FACULTY: return {programId: 6, roleId: 3};
      case invitationCode.ME_COORDINATOR: return {programId: 7, roleId: 2};
      case invitationCode.ME_FACULTY: return {programId: 7, roleId: 3};
      default: return null;
    }
  },
  convertToCode: (program, role) => {
    switch(role) {
      case 2:
        switch(program) {
          case 1: return invitationCode.CHE_COORDINATOR;
          case 2: return invitationCode.CE_COORDINATOR;
          case 3: return invitationCode.CPE_COORDINATOR;
          case 4: return invitationCode.ECE_COORDINATOR;
          case 5: return invitationCode.IE_COORDINATOR;
          case 6: return invitationCode.MEM_COORDINATOR;
          case 7: return invitationCode.ME_COORDINATOR;
        }
      case 3:
        switch(program) {
          case 1: return invitationCode.CHE_FACULTY;
          case 2: return invitationCode.CE_FACULTY;
          case 3: return invitationCode.CPE_FACULTY;
          case 4: return invitationCode.ECE_FACULTY;
          case 5: return invitationCode.IE_FACULTY;
          case 6: return invitationCode.MEM_FACULTY;
          case 7: return invitationCode.ME_FACULTY;
        }
      default: return null;
    }
  }
}
