"use strict";
var fs = require("fs");
var tsviz = require("./tsviz");
function getTheLaw(lawBookPath) {
    var expectedJSON = fs.readFileSync(lawBookPath, "utf8");
    var expected = JSON.parse(expectedJSON);
    return expected;
}
function enforceTheLaw(targetDir, moduleLaw, rightsToRead) {
    var modules = tsviz.getModulesDependencies(targetDir);
    var problemFound = false;
    var expectedModulesMap = {};
    moduleLaw.forEach(function (module) {
        var dependencies = {};
        module.dependencies.forEach(function (name) {
            dependencies[name] = null;
        });
        expectedModulesMap[module.name] = dependencies;
    });
    modules.forEach(function (module) {
        var expectedModuleDependencies = expectedModulesMap[module.name];
        if (!expectedModuleDependencies) {
            console.log("error : Unknown module '" + module.name + "'.\n" + rightsToRead);
            problemFound = true;
        }
        module.dependencies.forEach(function (dependency) {
            if (!(dependency in expectedModuleDependencies)) {
                console.log("error : '" + dependency + "' dependency not allowed in module '" + module.name + "'.\n" + rightsToRead);
                problemFound = true;
            }
        });
    });
    if (problemFound) {
        process.exit(1);
    }
}
var baseDir = process.argv[2];
var lawBook = baseDir + process.argv[3];
var rightsToRead = "Allowed modules and dependencies live in '" + lawBook + "'.\nBefore changing that file, validate it with a tech lead.\nCreating new dependecies make it harder to test, may introduce circular\ndependecy problems and will complicate code readability/maintenance.";
enforceTheLaw(baseDir, getTheLaw(lawBook), rightsToRead);
