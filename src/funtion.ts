
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");
const Tomcat = workspace.getConfiguration("tomcat");
const tomcatServerName = DUC.get('serverName', "");
const tomcatPath = Tomcat.get("workspace");
const tomcatWorkspace = tomcatPath + tomcatServerName;
const regExpSimul = /duc\-simulation\-slot\-[0-9]/;
const regExpUi = /duc\-ui\-slot\-[0-9]/;

export function settingCheck() {
	if(jvmPath === ''){
		vscode.window.showErrorMessage("JVM 8 경로를 찾을 수 없습니다.");
		return true;
	}
	else{
		if (!fs.existsSync(jvmPath)) {
			vscode.window.showErrorMessage("JVM 8 폴더가 없습니다.");
			return true;
		}
	}
	if(gradlePath === ''){
		vscode.window.showErrorMessage("Gradle 2.14 경로를 찾을 수 없습니다.");
		return true;
	}
	else{
		if (!fs.existsSync(gradlePath)) {
			vscode.window.showErrorMessage("Gradle 2.14 폴더가 없습니다.");
			return true;
		}
	}
	if(tomcatPath === ''){
		vscode.window.showErrorMessage("Tomcat Workspace를 찾을 수 없습니다.");
		return true;
	}
	if(tomcatServerName === ''){
		vscode.window.showErrorMessage("Tomcat Server Name을 찾을 수 없습니다.");
		return true;
	}
	return false;
}
