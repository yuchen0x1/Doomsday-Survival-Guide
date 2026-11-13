"""Isolated browser acceptance; requires Python Playwright and a running production preview."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4173')
parser.add_argument('--output', default='.evolution/browser-results')
args = parser.parse_args()
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='zh-CN')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(args.url + '/inventory')
    page.wait_for_load_state('networkidle')
    page.get_by_role('button', name='添加物资', exact=True).click()
    dialog = page.get_by_role('dialog')
    dialog.get_by_label('名称 *').fill('验收用饮水')
    dialog.get_by_label('分类', exact=True).select_option('water')
    dialog.get_by_label('数量', exact=True).fill('2')
    dialog.get_by_label('单位', exact=True).fill('瓶')
    dialog.get_by_label('最低库存（缺货线）').fill('5')
    dialog.get_by_label('有效期至').fill('2027-01-01')
    dialog.get_by_role('button', name='保存物资').click()
    expect(dialog).not_to_be_visible()
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    page.reload()
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    page.get_by_role('button', name='缺货提醒', exact=False).click()
    expect(page.get_by_text('需补 3 瓶', exact=True)).to_be_visible()
    with page.expect_download() as downloaded:
        page.get_by_role('button', name='导出补货清单（1）').click()
    csv = Path(downloaded.value.path()).read_text(encoding='utf-8-sig')
    assert '"2","5","3","瓶"' in csv
    page.screenshot(path=str(output / 'inventory-desktop.png'), full_page=True, animations='disabled')
    page.get_by_label('搜索物资', exact=True).fill('不存在的物资')
    expect(page.get_by_text('该分类下没有物资', exact=True)).to_be_visible()
    page.get_by_label('搜索物资', exact=True).fill('')
    page.get_by_role('button', name='在册物资', exact=False).click()
    page.get_by_title('编辑', exact=True).click()
    dialog.get_by_label('数量', exact=True).fill('5')
    dialog.get_by_label('有效期至').fill('')
    dialog.get_by_role('button', name='保存物资').click()
    expect(dialog).not_to_be_visible()
    expect(page.get_by_role('button', name='导出补货清单（0）')).to_be_disabled()
    page.get_by_role('button', name='减少', exact=True).click()
    expect(page.get_by_role('button', name='导出补货清单（1）')).to_be_enabled()
    results.append('PASS inventory add/edit/clear expiry/persist/filter/adjust/replenishment CSV')

    with page.expect_download() as downloaded:
        page.get_by_role('button', name='导出全量备份').click()
    backup = Path(downloaded.value.path()).read_bytes()
    payload = json.loads(backup)
    assert payload['inventory'][0]['quantity'] == 4
    assert sum(t['delta'] for t in payload['transactions']) == 2
    assert 'expiresAt' not in payload['inventory'][0]
    page.get_by_label('选择备份文件').set_input_files({'name': 'backup.json', 'mimeType': 'application/json', 'buffer': backup})
    expect(dialog.get_by_text('确认恢复备份', exact=True)).to_be_visible()
    # Focus cannot escape the confirmation dialog with Tab / Shift+Tab.
    dialog.get_by_role('button', name='合并并恢复').focus()
    page.keyboard.press('Tab')
    assert page.evaluate("document.querySelector('[role=dialog]').contains(document.activeElement)")
    dialog.get_by_role('button', name='取消').click()
    expect(dialog).not_to_be_visible()
    page.get_by_label('选择备份文件').set_input_files({'name': 'broken.json', 'mimeType': 'application/json', 'buffer': b'{"version":1,"notes":[{}]}'})
    expect(page.get_by_text('笔记第 1 条记录格式不正确', exact=True)).to_be_visible()
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    page.get_by_label('选择备份文件').set_input_files({'name': 'backup.json', 'mimeType': 'application/json', 'buffer': backup})
    dialog.get_by_role('button', name='合并并恢复').click()
    page.wait_for_event('load')
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    results.append('PASS backup export/preview/cancel/reject malformed/restore/focus trap')

    page.goto(args.url + '/settings')
    page.get_by_label('记录阅读历史', exact=False).uncheck()
    expect(page.get_by_text('设置已保存', exact=True)).to_be_visible()
    page.get_by_label('紧凑排版', exact=False).check()
    page.wait_for_function("document.documentElement.dataset.compact === 'true'")
    page.reload()
    expect(page.get_by_label('记录阅读历史', exact=False)).not_to_be_checked()
    page.wait_for_function("document.documentElement.dataset.compact === 'true'")
    page.get_by_label('紧凑排版', exact=False).uncheck()
    results.append('PASS preference persistence and compact layout')

    for route in ['/knowledge', '/plants', '/animals', '/insects', '/medicines', '/first-aid', '/skills', '/supplies', '/calculators', '/simulator', '/learn', '/bookmarks', '/profile', '/offline', '/hazards', '/search', '/admin']:
        page.goto(args.url + route)
        page.wait_for_load_state('networkidle')
        expect(page.locator('main h1').first).to_be_visible()
    results.append('PASS 17 existing page routes')

    page.goto(args.url + '/inventory')
    page.wait_for_load_state('networkidle')
    page.evaluate('navigator.serviceWorker.ready.then(() => true)')
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    context.set_offline(True)
    page.reload()
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    page.get_by_role('button', name='增加', exact=True).click()
    expect(page.get_by_role('button', name='导出补货清单（0）')).to_be_disabled()
    page.reload()
    expect(page.get_by_text('验收用饮水', exact=True)).to_be_visible()
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.screenshot(path=str(output / 'inventory-mobile.png'), full_page=True, animations='disabled')
    page.get_by_title('编辑', exact=True).click()
    expect(dialog).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.wait_for_function("Math.abs(document.querySelector('[role=dialog]').parentElement.getBoundingClientRect().top) < 0.1")
    assert page.evaluate("document.querySelector('[role=dialog]').parentElement.parentElement === document.body")
    page.screenshot(path=str(output / 'inventory-mobile-editor.png'), full_page=True, animations='disabled')
    page.keyboard.press('Escape')
    expect(dialog).not_to_be_visible()
    results.append('PASS production service worker offline reload/write and 390px layout')
    context.set_offline(False)
    page.goto(args.url + '/settings')
    page.wait_for_load_state('networkidle')
    page.evaluate("""async () => {
      localStorage.setItem('unrelated-setting', 'keep');
      await new Promise((resolve, reject) => { const r = indexedDB.open('unrelated-app', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('data');
        r.onsuccess = () => { const db = r.result; const tx = db.transaction('data', 'readwrite');
          tx.objectStore('data').put('keep', 'sentinel'); tx.oncomplete = () => { db.close(); resolve(); }; };
        r.onerror = () => reject(r.error); });
    }""")
    page.on('dialog', lambda d: d.accept())
    page.get_by_role('button', name='清除本地数据').click()
    page.wait_for_event('load')
    assert page.evaluate("localStorage.getItem('unrelated-setting')") == 'keep'
    assert page.evaluate("""async () => new Promise(resolve => { const r = indexedDB.open('unrelated-app'); r.onsuccess = () => {
      const db = r.result; const q = db.transaction('data').objectStore('data').get('sentinel'); q.onsuccess = () => { db.close(); resolve(q.result); }; }; })""") == 'keep'
    page.goto(args.url + '/inventory')
    expect(page.get_by_text('清单还是空的', exact=True)).to_be_visible()
    results.append('PASS reset clears app records and preserves unrelated database/localStorage')
    assert not errors, errors
    results.append('PASS no uncaught browser errors')
    browser.close()

(output / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print('\n'.join(results))
