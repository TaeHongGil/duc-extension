// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fnc from './funtion';
import * as fs from 'fs';
import * as os from 'os';
import * as date from 'date-and-time';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const Tomcat = workspace.getConfiguration("tomcat");
const tomcatServerName = DUC.get('serverName', "");
const tomcatPath = Tomcat.get("workspace");
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");
const serverHome: string = DUC.get("serverHome");
const mainProject: string = DUC.get("mainProject");
let tomcatWorkspace: string = tomcatPath + "/" + tomcatServerName;
if (serverHome !== "") {
    tomcatWorkspace = serverHome;
}

export async function createSimul() {
    // curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml
    let home = os.homedir() + "/.m2/repository";
    if (!fs.existsSync(home)) {
        vscode.window.showErrorMessage(home + " 폴더가 존재하지않습니다.");
        return;
    }
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    const regExp = /[0-9]/;
    if (!regExp.test(slotNum)) {
        vscode.window.showErrorMessage("다시 입력해주세요");
        return;
    }
    let terminal = vscode.window.createTerminal({
        name: "Create Siulation Project",
        hideFromUser: false,
    });
    terminal.show();
    terminal.sendText("cd " + home);
    terminal.sendText("curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml");
    terminal.sendText("cd " + workspace.workspaceFolders[0].uri.fsPath);

    let simulTypeVersion = "2.0.0.51";
    let simulCoreVersion = "2.0.0.21-SNAPSHOT";
    terminal.sendText("mvn org.apache.maven.plugins:maven-archetype-plugin:3.1.2:generate \
-DarchetypeArtifactId=\"duc-simulation-arch\" \
-DarchetypeGroupId=\"com.doubleugames.dug\" \
-DarchetypeVersion=\""+ simulTypeVersion + "\" \
-DgroupId=\"com.doubleugames.dug.duc\" \
-Dpackage=\"com.doubleugames.dug.duc\" \
-DartifactId=\"duc-simulation-slot-"+ slotNum + "\" \
-Dversion=\"2.0.0.00\" \
-Dslotname=\""+ slotNum + "\" \
-Dsimulcorever=\""+ simulCoreVersion + "\" \
-Dslotnumber=\""+ slotNum + "\" <<EOF\n\
y\n\
EOF\n\
");
}

export async function createUi() {
    // curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml
    let home = os.homedir() + "/.m2/repository";
    if (!fs.existsSync(home)) {
        vscode.window.showErrorMessage(home + " 폴더가 존재하지않습니다.");
        return;
    }
    let slotNum = await vscode.window.showInputBox({
        placeHolder: "Slot number",
        prompt: "Slot number",
    });
    const regExp = /[0-9]/;
    if (!regExp.test(slotNum)) {
        vscode.window.showErrorMessage("다시 입력해주세요");
        return;
    }
    let slotName = await vscode.window.showInputBox({
        placeHolder: "Slot Name",
        prompt: "Slot Name",
    });
    if (slotName === "") {
        vscode.window.showErrorMessage("다시 입력해주세요");
        return;
    }
    const regExpName = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    let slotClassName = "CSlot" + slotNum + slotName.replace(regExpName, "");
    let terminal = vscode.window.createTerminal({
        name: "Create Ui Project",
        hideFromUser: false,
    });
    let now = new Date();
    let time = date.format(now, 'YYYY.MM.DD');
    terminal.show();
    terminal.sendText("cd " + home);
    terminal.sendText("curl -O http://html5-tools.doubleugames.com:8081/repository/maven-releases/archetype-catalog.xml");
    terminal.sendText("cd " + workspace.workspaceFolders[0].uri.fsPath);
    terminal.sendText("mvn org.apache.maven.plugins:maven-archetype-plugin:3.1.2:generate \
-DarchetypeArtifactId=\"duc-archetype-ui-slot\" \
-DarchetypeGroupId=\"com.doubleugames.dug.duc\" \
-DarchetypeVersion=\"2.0.0.20\" \
-DgroupId=\"com.doubleugames.dug.duc\" \
-Dpackage=\"com.doubleugames.dug.duc\" \
-DartifactId=\"duc-ui-slot-"+ slotNum + "\" \
-Dversion=\"2.0.0.00\" \
-DslotType=\""+ slotNum + "\" \
-DslotName=\""+ slotName + "\" \
-DslotClassName=\""+ slotClassName + "\" \
-DcurrentDate=\""+ time + "\" \
");
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
    if (fnc.settingCheck()) {
        return;
    }
    str = workspace.workspaceFolders[0].uri.fsPath + "/" + mainProject + "-simulation-slot-" + slotNum;
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
            terminal.sendText("cp " + str + "/target/*-SNAPSHOT.jar " + tomcatWorkspace + "/webapps/" + mainProject + "-simulation-web/WEB-INF/lib/");
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
    if (fnc.settingCheck()) {
        return;
    }
    str = workspace.workspaceFolders[0].uri.fsPath + "/" + mainProject + "-simulation-slot-" + slotNum;
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
    if (fnc.settingCheck()) {
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
    if (fnc.settingCheck()) {
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
