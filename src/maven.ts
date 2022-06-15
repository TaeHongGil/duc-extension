// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FileSystemProvider, Entry } from './fileExplorer';
import * as utils from './funtion';
import * as mobile from './mobile';
import * as maven from './maven';
import * as fs from 'fs';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const Tomcat = workspace.getConfiguration("tomcat");
const tomcatServerName = DUC.get('serverName', "");
const tomcatPath = Tomcat.get("workspace");
const tomcatWorkspace = tomcatPath + "/" + tomcatServerName;
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");

export async function createSimul(context: vscode.ExtensionContext) {
    // curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml
}
export async function createUi(context: vscode.ExtensionContext) {
    // curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml
}

export async function refresh() {
    let str = "";
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    if (slotNum === "") {
        vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
        return;
    }
    if (utils.settingCheck()) {
        return;
    }
    str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-simulation-slot-" + slotNum;
    if (fs.existsSync(str)) {
        let terminal = vscode.window.createTerminal({
            name: "Simulation Refresh",
            hideFromUser: false,
        });
        terminal.show();
        terminal.sendText("export GRADLE_HOME=" + gradlePath);
        terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
        terminal.sendText("export JAVA_HOME=" + jvmPath);
        terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
        terminal.sendText("cd " + str);
        if (fs.existsSync(tomcatWorkspace)) {
            terminal.sendText("mvn install");
            terminal.sendText("cp " + str + "/target/*-SNAPSHOT.jar " + tomcatWorkspace + "/webapps/duc-simulation-web/WEB-INF/lib/");
        }
        else {
            vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
        }
    }
    else {
        vscode.window.showErrorMessage("해당 경로에 시뮬레이션 폴더가 없습니다.");
    }
}
export async function deploy() {
    let str = "";
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    if (slotNum === "") {
        vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
        return;
    }
    if (utils.settingCheck()) {
        return;
    }
        str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-simulation-slot-" + slotNum;
    if (fs.existsSync(str)) {
        let terminal = vscode.window.createTerminal({
            name: "Simulation Deploy",
            hideFromUser: false,
        });
        terminal.show();
        terminal.sendText("export GRADLE_HOME=" + gradlePath);
        terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
        terminal.sendText("export JAVA_HOME=" + jvmPath);
        terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
        terminal.sendText("cd " + str);
        terminal.sendText("mvn deploy");
    }
    else {
        vscode.window.showErrorMessage("해당 경로에 시뮬레이션 폴더가 없습니다.");
    }
}
export async function webpack() {
    let str = "";
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    if (slotNum === "") {
        vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
        return;
    }
    if (utils.settingCheck()) {
        return;
    }
    str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-ui-slot-" + slotNum;
    if (fs.existsSync(str)) {
        let terminal = vscode.window.createTerminal({
            name: "UI Webpack",
            hideFromUser: false,
        });
        terminal.show();
        terminal.sendText("export GRADLE_HOME=" + gradlePath);
        terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
        terminal.sendText("export JAVA_HOME=" + jvmPath);
        terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
        terminal.sendText("cd " + str);
        terminal.sendText("mvn frontend:webpack");
        terminal.sendText("mvn antrun:run");
        if (fs.existsSync(tomcatWorkspace)) {
            if (workspace.workspaceFolders) {
                terminal.sendText("rsync -ruv --delete " + workspace.workspaceFolders[0].uri.fsPath + "/dug-cdn-web/src/main/webapp/ " + tomcatWorkspace + "/webapps/dug-cdn-web/");
            }
        }
        else {
            vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
        }
    }
    else {
        vscode.window.showErrorMessage("해당 경로에 UI 프로젝트 폴더가 없습니다.");
    }
}
export async function gradleTask() {
    let str = "";
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    if (slotNum === "") {
        vscode.window.showErrorMessage("슬롯번호가 입력되지 않았습니다.");
        return;
    }
    if (utils.settingCheck()) {
        return;
    }
    str = workspace.workspaceFolders[0].uri.fsPath + "/" + "duc-ui-slot-" + slotNum;
    if (fs.existsSync(str)) {
        let terminal = vscode.window.createTerminal({
            name: "Gradle Task",
            hideFromUser: false,
        });
        terminal.show();
        terminal.sendText("export JAVA_HOME=" + jvmPath);
        terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
        terminal.sendText("cd " + str);
        terminal.sendText(gradlePath + "/bin/gradle deployCdnAnimateSlot");
        if (fs.existsSync(tomcatWorkspace)) {
            if (workspace.workspaceFolders) {
                terminal.sendText("rsync -ruv --delete " + workspace.workspaceFolders[0].uri.fsPath + "/dug-cdn-web/src/main/webapp/ " + tomcatWorkspace + "/webapps/dug-cdn-web/");
            }
        }
        else {
            vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
        }
    }
    else {
        vscode.window.showErrorMessage("해당 경로에 UI 프로젝트 폴더가 없습니다.");
    }
}
