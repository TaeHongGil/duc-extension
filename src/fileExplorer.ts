import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as fnc from './funtion';
import * as util from './util';

const workspace = vscode.workspace;
const DUC = workspace.getConfiguration("DUC");
const Tomcat = workspace.getConfiguration("tomcat");
const tomcatServerName = DUC.get('serverName', "");
const tomcatPath = Tomcat.get("workspace");
const jvmPath = DUC.get('jvmPath', "");
const gradlePath = DUC.get('gradlePath', "");
const directorySetting = DUC.get('directorySetting', "");
const serverHome: string = DUC.get("serverHome");
let tomcatWorkspace: string = tomcatPath + "/" + tomcatServerName;
if (serverHome !== "") {
	tomcatWorkspace = serverHome;
}
namespace _ {

	function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
		if (error) {
			reject(massageError(error));
		} else {
			resolve(result);
		}
	}

	function massageError(error: Error & { code?: string }): Error {
		if (error.code === 'ENOENT') {
			return vscode.FileSystemError.FileNotFound();
		}

		if (error.code === 'EISDIR') {
			return vscode.FileSystemError.FileIsADirectory();
		}

		if (error.code === 'EEXIST') {
			return vscode.FileSystemError.FileExists();
		}

		if (error.code === 'EPERM' || error.code === 'EACCESS') {
			return vscode.FileSystemError.NoPermissions();
		}

		return error;
	}

	export function checkCancellation(token: vscode.CancellationToken): void {
		if (token.isCancellationRequested) {
			throw new Error('Operation cancelled');
		}
	}

	export function normalizeNFC(items: string): string;
	export function normalizeNFC(items: string[]): string[];
	export function normalizeNFC(items: string | string[]): string | string[] {
		if (process.platform !== 'darwin') {
			return items;
		}

		if (Array.isArray(items)) {
			return items.map(item => item.normalize('NFC'));
		}

		return items.normalize('NFC');
	}

	export function readdir(path: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
		});
	}

	export function stat(path: string): Promise<fs.Stats> {
		return new Promise<fs.Stats>((resolve, reject) => {
			fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
		});
	}

	export function readfile(path: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
		});
	}

	export function writefile(path: string, content: Buffer): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
		});
	}

	export function exists(path: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			fs.exists(path, exists => handleResult(resolve, reject, null, exists));
		});
	}

	export function rmrf(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			rimraf(path, error => handleResult(resolve, reject, error, void 0));
		});
	}

	export function mkdir(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			// mkdirp(path, error => handleResult(resolve, reject, error, void 0));
		});
	}

	export function rename(oldPath: string, newPath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
		});
	}

	export function unlink(path: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
		});
	}
}

export class FileStat implements vscode.FileStat {

	constructor(private fsStat: fs.Stats) { }

	get type(): vscode.FileType {
		return this.fsStat.isFile() ? vscode.FileType.File : this.fsStat.isDirectory() ? vscode.FileType.Directory : this.fsStat.isSymbolicLink() ? vscode.FileType.SymbolicLink : vscode.FileType.Unknown;
	}

	get isFile(): boolean | undefined {
		return this.fsStat.isFile();
	}

	get isDirectory(): boolean | undefined {
		return this.fsStat.isDirectory();
	}

	get isSymbolicLink(): boolean | undefined {
		return this.fsStat.isSymbolicLink();
	}

	get size(): number {
		return this.fsStat.size;
	}

	get ctime(): number {
		return this.fsStat.ctime.getTime();
	}

	get mtime(): number {
		return this.fsStat.mtime.getTime();
	}
}

export interface Entry {
	uri: string;
}

export class FileSystemProvider implements vscode.TreeDataProvider<Entry>, vscode.FileSystemProvider {

	private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;
	private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> = new vscode.EventEmitter<Entry | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> = this._onDidChangeTreeData.event;

	constructor(context: vscode.ExtensionContext) {
		this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	}

	get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
		return this._onDidChangeFile.event;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
		const watcher = fs.watch(uri.fsPath, { recursive: options.recursive }, async (event, filename) => {
			if (filename) {
				const filepath = path.join(uri.fsPath, _.normalizeNFC(filename.toString()));

				// TODO support excludes (using minimatch library?)

				this._onDidChangeFile.fire([{
					type: event === 'change' ? vscode.FileChangeType.Changed : await _.exists(filepath) ? vscode.FileChangeType.Created : vscode.FileChangeType.Deleted,
					uri: uri.with({ path: filepath })
				} as vscode.FileChangeEvent]);
			}
		});

		return { dispose: () => watcher.close() };
	}

	stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
		return this._stat(uri.fsPath);
	}

	async _stat(path: string): Promise<vscode.FileStat> {
		return new FileStat(await _.stat(path));
	}

	readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
		return this._readDirectory(uri);
	}

	async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		const children = await _.readdir(uri.fsPath);

		const result: [string, vscode.FileType][] = [];
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			const stat = await this._stat(path.join(uri.fsPath, child));
			result.push([child, stat.type]);
		}

		return Promise.resolve(result);
	}

	createDirectory(uri: vscode.Uri): void | Thenable<void> {
		return _.mkdir(uri.fsPath);
	}

	readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
		return _.readfile(uri.fsPath);
	}

	writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
		return this._writeFile(uri, content, options);
	}

	async _writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Promise<void> {
		const exists = await _.exists(uri.fsPath);
		if (!exists) {
			if (!options.create) {
				throw vscode.FileSystemError.FileNotFound();
			}

			await _.mkdir(path.dirname(uri.fsPath));
		} else {
			if (!options.overwrite) {
				throw vscode.FileSystemError.FileExists();
			}
		}

		return _.writefile(uri.fsPath, content as Buffer);
	}

	delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
		if (options.recursive) {
			return _.rmrf(uri.fsPath);
		}

		return _.unlink(uri.fsPath);
	}

	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
		return this._rename(oldUri, newUri, options);
	}

	async _rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): Promise<void> {
		const exists = await _.exists(newUri.fsPath);
		if (exists) {
			if (!options.overwrite) {
				throw vscode.FileSystemError.FileExists();
			} else {
				await _.rmrf(newUri.fsPath);
			}
		}

		const parentExists = await _.exists(path.dirname(newUri.fsPath));
		if (!parentExists) {
			await _.mkdir(path.dirname(newUri.fsPath));
		}

		return _.rename(oldUri.fsPath, newUri.fsPath);
	}

	// tree data provider

	async getChildren(element?: Entry): Promise<Entry[]> {
		if (workspace.workspaceFolders) {

			// if (element) {
			// 	const children = await this.readDirectory(element.uri);
			// 	return children.map(([name, type]) => ({ uri: vscode.Uri.file(path.join(element.uri.fsPath, name)), type }));
			// }

			const workspaceFolder = workspace.workspaceFolders[0];
			if (workspaceFolder) {
				let array = directorySetting.split(",");
				let children = await this.readDirectory(workspaceFolder.uri);
				children = children.filter(array => array[1] === vscode.FileType.Directory);
				// children = children.filter(array => (array[0].indexOf("dug\-") >= 0 || array[0].indexOf("duc\-") >= 0));
				let ASC = 1;
				let DESC = -1;

				let childrenTemp: [string, vscode.FileType][] = [];
				array.forEach(element => {
					if (element === '') {
						return;
					}
					let str = element + "\-";
					for (let index = 0; index < children.length; index++) {
						const folderName = children[index][0];
						if (folderName.indexOf(element + "\-") >= 0) {
							childrenTemp.push(children[index]);
							children.splice(index, 1);
							index--;
						}
					}
				});
				childrenTemp.sort((a, b) => {
					if (a[1] === b[1]) {
						return a[0].localeCompare(b[0], undefined, {
							numeric: true,
							sensitivity: 'base'
						  });
					}
					return a[1] === vscode.FileType.Directory ? -1 : 1;
				});
				return childrenTemp.map(([name, type]) => (
					{ uri: name }
				));
			}
		}
		return [];
	}

	getTreeItem(element: Entry): vscode.TreeItem {
		// if (element.type === vscode.FileType.File) {
		// 	treeItem.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [element.uri], };
		// 	treeItem.contextValue = 'file';
		// }
		return {
			label: /**vscode.TreeItemLabel**/<any>{ label: element.uri },
			contextValue: "entry"
		};
	}

	update(node: Entry, context: vscode.ExtensionContext) {
		let project = "";
		if (workspace.workspaceFolders) {
			project = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}
		let terminal = vscode.window.createTerminal({
			name: "Maven Update",
			hideFromUser: false,
		});
		terminal.show();
		terminal.sendText(`bash ${context.extensionPath}/script/mavenUpdate.sh ${project} ${gradlePath} ${jvmPath} ${tomcatWorkspace}`);
	}

	deploy(node: Entry) {
		if (fnc.settingCheck()) {
			return;
		}
		let str = "";
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}
		let terminal = vscode.window.createTerminal({
			name: "Maven Deploy",
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

	install(node: Entry) {
		if (fnc.settingCheck()) {
			return;
		}
		let str = ""
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}
		let terminal = vscode.window.createTerminal({
			name: "Maven Install",
			hideFromUser: false,
		});
		terminal.show();
		terminal.sendText("export GRADLE_HOME=" + gradlePath);
		terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
		terminal.sendText("export JAVA_HOME=" + jvmPath);
		terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
		terminal.sendText("cd " + str);
		terminal.sendText("mvn clean install -U");
	}

	webpack(node: Entry) {
		if (fnc.settingCheck()) {
			return;
		}
		let str = ""
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}
		let terminal = vscode.window.createTerminal({
			name: "Maven Webpack",
			hideFromUser: false,
		});
		terminal.show();
		terminal.sendText("export GRADLE_HOME=" + gradlePath);
		terminal.sendText("export PATH=$GRADLE_HOME/bin:$PATH");
		terminal.sendText("export JAVA_HOME=" + jvmPath);
		terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
		terminal.sendText("cd " + str);
		terminal.sendText("mvn frontend:webpack");
		terminal.sendText("mvn org.apache.maven.plugins:maven-antrun-plugin:1.3:run");
		if (fs.existsSync(tomcatWorkspace)) {
			if (workspace.workspaceFolders) {
				terminal.sendText("rsync -ruv --delete " + workspace.workspaceFolders[0].uri.fsPath + "/dug-cdn-web/src/main/webapp/ " + tomcatWorkspace + "/webapps/dug-cdn-web/");
			}
		}
		else {
			vscode.window.showErrorMessage("tomcat 서버 폴더가 없습니다.");
		}
	}

	gradleTask(node: Entry) {
		if (fnc.settingCheck()) {
			return;
		}
		let str = ""
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}

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

	gradleTaskPublishAnimate(context: vscode.ExtensionContext, node: Entry) {
		if (fnc.settingCheck()) {
			return;
		}
		let str = ""
		if (workspace.workspaceFolders) {
			str = workspace.workspaceFolders[0].uri.fsPath + "/" + node.uri;
		}

		util.publishAnimate(context, str +"/src/main/animate");
		let terminal = vscode.window.createTerminal({
			name: "Gradle Task",
			hideFromUser: false,
		});
		terminal.show();
		terminal.sendText("export JAVA_HOME=" + jvmPath);
		terminal.sendText("export PATH=${PATH}:$JAVA_HOME/bin");
		
		terminal.sendText('eval "/Applications/Adobe\\ Animate\\ CC\\ 2019/Adobe\\ Animate\\ CC\\ 2019.app/Contents/MacOS/Adobe\\ Animate\\ CC\\ 2019" "'+context.extensionPath + '/script/test.jsfl"');
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
}
