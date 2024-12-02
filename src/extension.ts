import * as vscode from 'vscode';

// Keep track of current and previous tab
let currentTab: { uri: string, viewColumn: number } | undefined;
let previousTab: { uri: string, viewColumn: number } | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Track active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                const newTab = {
                    uri: editor.document.uri.toString(),
                    viewColumn: editor.viewColumn || 1
                };

                // Only update if it's actually a different tab
                if (currentTab?.uri !== newTab.uri) {
                    previousTab = currentTab;
                    currentTab = newTab;
                }
            }
        })
    );

    // Initialize with current editor if any
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        currentTab = {
            uri: activeEditor.document.uri.toString(),
            viewColumn: activeEditor.viewColumn || 1
        };
    }

    let disposable = vscode.commands.registerCommand('tab-fuzzy-finder.findTab', async () => {
        const tabGroups = vscode.window.tabGroups;
        
        // Get all open tabs across all groups
        const allTabs: { label: string, editor: vscode.TextDocument, viewColumn: number }[] = [];
        
        // Add all tabs, marking current and previous appropriately
        tabGroups.all.forEach(group => {
            group.tabs.forEach(tab => {
                if (tab.input instanceof vscode.TabInputText) {
                    const uri = tab.input.uri;
                    const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
                    if (document) {
                        let prefix = '';
                        const tabUri = uri.toString();
                        if (previousTab && tabUri === previousTab.uri) {
                            prefix = '↩ '; // Previous tab
                        } else if (currentTab && tabUri === currentTab.uri) {
                            prefix = '● '; // Current tab
                        }
                        
                        allTabs.push({
                            label: `${prefix}${tab.label}${getGroupLabel(group.viewColumn)}`,
                            editor: document,
                            viewColumn: group.viewColumn || 1
                        });
                    }
                }
            });
        });

        // Sort to ensure previous tab is first, then current tab
        allTabs.sort((a, b) => {
            const aUri = a.editor.uri.toString();
            const bUri = b.editor.uri.toString();
            if (previousTab && aUri === previousTab.uri) return -1;
            if (previousTab && bUri === previousTab.uri) return 1;
            if (currentTab && aUri === currentTab.uri) return -1;
            if (currentTab && bUri === currentTab.uri) return 1;
            return 0;
        });

        if (allTabs.length === 0) {
            vscode.window.showInformationMessage('No open tabs found');
            return;
        }

        // Show quick pick with all tabs
        const selected = await vscode.window.showQuickPick(
            allTabs.map(item => item.label),
            {
                placeHolder: 'Select a tab to switch to',
                matchOnDescription: true,
                matchOnDetail: true
            }
        );

        if (selected) {
            const selectedTab = allTabs.find(item => item.label === selected);
            if (selectedTab) {
                await vscode.window.showTextDocument(selectedTab.editor, {
                    viewColumn: selectedTab.viewColumn,
                    preserveFocus: false
                });
            }
        }
    });

    context.subscriptions.push(disposable);
}

function getGroupLabel(viewColumn: number | undefined): string {
    return viewColumn ? ` (Group ${viewColumn})` : '';
}

export function deactivate() {} 