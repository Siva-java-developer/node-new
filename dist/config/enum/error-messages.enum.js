"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = void 0;
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["AppStartupFail"] = "Unable to start the app!";
    ErrorMessages["CreateFail"] = "Unable to save entry to DB!";
    ErrorMessages["GetFail"] = "Unable to retrieve data from DB!";
    ErrorMessages["UpdateFail"] = "Unable to update data in DB!";
    ErrorMessages["DeleteFail"] = "Unable to delete entry from DB!";
    ErrorMessages["DuplicateEntryFail"] = "User already exists!";
    ErrorMessages["PasswordMismatchFail"] = "Passwords must match!";
    ErrorMessages["Generic"] = "Something went wrong!";
    ErrorMessages["NotFound"] = "Unable to find the requested resource!";
    ErrorMessages["UncaughtException"] = "Uncaught Exception thrown!";
    ErrorMessages["UnhandledRejection"] = "Unhandled Exception thrown!";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));
//# sourceMappingURL=error-messages.enum.js.map