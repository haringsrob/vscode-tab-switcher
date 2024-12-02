import * as vscode from 'vscode';

// Keep track of tab history
let tabHistory: { uri: string, viewColumn: number }[] = [];

export function activate(context: vscode.ExtensionContext) {
    // Track active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                console.log('Editor changed:', editor.document.uri.toString());
                updateTabHistory(editor.document.uri.toString(), editor.viewColumn || 1);
            }
        })
    );

    // Initialize with all currently open editors
    initializeTabHistory();

    let disposable = vscode.commands.registerCommand('tab-fuzzy-finder.findTab', async () => {
        const tabGroups = vscode.window.tabGroups;
        
        // Get all open tabs across all groups
        const allTabs: { label: string, editor: vscode.TextDocument, viewColumn: number }[] = [];
        
        // Get current and previous tabs info
        const currentTabInfo = tabHistory[0];
        const previousTabInfo = tabHistory[1];
        
        // Add all tabs, marking current and previous appropriately
        tabGroups.all.forEach(group => {
            group.tabs.forEach(tab => {
                if (tab.input instanceof vscode.TabInputText) {
                    const uri = tab.input.uri;
                    const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
                    if (document) {
                        let prefix = '';
                        const tabInfo = uri.toString();
                        if (previousTabInfo && tabInfo === previousTabInfo.uri) {
                            prefix = '↩ '; // Previous tab
                        } else if (currentTabInfo && tabInfo === currentTabInfo.uri) {
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
            if (previousTabInfo && aUri === previousTabInfo.uri) return -1;
            if (previousTabInfo && bUri === previousTabInfo.uri) return 1;
            if (currentTabInfo && aUri === currentTabInfo.uri) return -1;
            if (currentTabInfo && bUri === currentTabInfo.uri) return 1;
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

function initializeTabHistory() {
    // Get all open tabs and add them to history
    const tabGroups = vscode.window.tabGroups;
    const activeTab = vscode.window.activeTextEditor;
    
    // First, add the active tab
    if (activeTab) {
        updateTabHistory(activeTab.document.uri.toString(), activeTab.viewColumn || 1);
    }

    // Then add all other tabs
    tabGroups.all.forEach(group => {
        group.tabs.forEach(tab => {
            if (tab.input instanceof vscode.TabInputText) {
                const uri = tab.input.uri.toString();
                // Don't add the active tab again
                if (!activeTab || uri !== activeTab.document.uri.toString()) {
                    updateTabHistory(uri, group.viewColumn || 1);
                }
            }
        });
    });

    console.log('Initialized tab history:', tabHistory);
}

function updateTabHistory(uri: string, viewColumn: number) {
    console.log('Updating history with:', uri);
    
    // Remove the uri from history if it's already there
    tabHistory = tabHistory.filter(tab => tab.uri !== uri);
    
    // Add it to the front of the history
    tabHistory.unshift({ uri, viewColumn });
    
    // Keep only the last 10 tabs in history
    if (tabHistory.length > 10) {
        tabHistory = tabHistory.slice(0, 10);
    }

    console.log('Current history:', tabHistory);
}

function getGroupLabel(viewColumn: number | undefined): string {
    return viewColumn ? ` (Group ${viewColumn})` : '';
}

export function deactivate() {} 