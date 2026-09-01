import re

def update_view_fees():
    path = r'C:\Users\nikhi\Desktop\SchoolProject\Admin\src\components\payments\setting\ViewFees.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # DropdownSelect and ActionButton need to receive the theme
    content = content.replace('function DropdownSelect({ label }) {', 'function DropdownSelect({ label, theme }) {')
    content = content.replace('bg-[#f0f6f9] border border-[#e7e2e2]', '${theme.inputBg} border ${theme.border}')
    content = content.replace('className="relative flex items-center', 'className={`relative flex items-center')
    content = content.replace('select-none">', 'select-none`}>')
    content = content.replace('text-[#6e6e6e]', '${theme.inputText}')
    content = content.replace('className="text-[13px]', 'className={`text-[13px]')
    content = content.replace('whitespace-nowrap">', 'whitespace-nowrap`}>')
    
    content = content.replace('function ActionButton({ icon, label, disabled = false, onClick }) {', 'function ActionButton({ icon, label, disabled = false, onClick, theme, isDarkMode }) {')
    content = content.replace('border-[#ecebeb]', '${theme.border}')
    content = content.replace('text-[#0f0f0f]', '${theme.text}')
    content = content.replace('hover:bg-gray-50', '${isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-gray-50"}')
    content = content.replace('text-[#a8a7a7]', '${theme.subText}')

    # Page Header
    content = content.replace('className="text-[20px] font-bold text-[#0f0f0f]', 'className={`text-[20px] font-bold ${theme.text}')
    content = content.replace('mb-1">', 'mb-1`}>')
    content = content.replace('className="text-[13px] font-medium text-[#686868]">', 'className={`text-[13px] font-medium ${theme.subText}`}>')

    # Table card
    content = content.replace('className="bg-white border border-[#e7e2e2]', 'className={`${theme.card} border ${theme.border}')
    content = content.replace('overflow-hidden">', 'overflow-hidden`}>')
    
    # Filter bar
    content = content.replace('border-b border-[#e7e2e2]', 'border-b ${theme.border}')
    content = content.replace('px-5 py-4 border-b ${theme.border}">', 'px-5 py-4 border-b ${theme.border}`}>')
    content = content.replace('className="flex items-center gap-4 px-5 py-4', 'className={`flex items-center gap-4 px-5 py-4')
    
    # Search input area
    content = content.replace('className="flex items-center gap-2.5 bg-[#f0f6f9] border border-[#e7e2e2]', 'className={`flex items-center gap-2.5 ${theme.inputBg} border ${theme.border}')
    content = content.replace('w-[280px]">', 'w-[280px]`}>')
    content = content.replace('className="text-[13px] font-normal text-[#6e6e6e]">', 'className={`text-[13px] font-normal ${theme.inputText}`}>')

    # Dropdowns in ViewFees
    content = content.replace('<DropdownSelect label="All Classes" />', '<DropdownSelect label="All Classes" theme={theme} />')
    content = content.replace('<DropdownSelect label="All Academic Years" />', '<DropdownSelect label="All Academic Years" theme={theme} />')
    content = content.replace('<DropdownSelect label="All Status" />', '<DropdownSelect label="All Status" theme={theme} />')

    # Table header
    content = content.replace('className="bg-[#f0f6f9] border-t border-l border-r border-[#e7e2e2]">', 'className={`${theme.tableHead} border-t border-l border-r ${theme.border}`}>')
    content = content.replace('text-[#002861]', '${theme.text}')
    content = re.sub(r'className="(.*?)\$\{theme\.text\}(.*?)">', r'className={`\1${theme.text}\2`}>', content)
    
    # Table rows
    content = content.replace('className="px-6 py-10 text-center text-sm text-[#686868]">', 'className={`px-6 py-10 text-center text-sm ${theme.subText}`}>')
    content = content.replace('border-b border-[#d0d0d0]/40', 'border-b ${theme.border}')
    
    content = content.replace('text-[#0f0f0f]', '${theme.text}')
    content = re.sub(r'className="(.*?)\$\{theme\.text\}(.*?)">', r'className={`\1${theme.text}\2`}>', content)

    # ActionButton calls in ViewFees
    content = content.replace('onClick={() => openClassFeeStructure(row)}', 'onClick={() => openClassFeeStructure(row)}\n                            theme={theme}\n                            isDarkMode={isDarkMode}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_school_fee_setting():
    path = r'C:\Users\nikhi\Desktop\SchoolProject\Admin\src\components\payments\setting\SchoolFeeSetting.jsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need theme object
    theme_obj = '''  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);
  const theme = {
    bg: isDarkMode ? "bg-[#0B0D14]" : "bg-[#f8fafc]",
    surface: isDarkMode ? "bg-[#111315]" : "bg-white",
    card: isDarkMode ? "bg-[#181b24]" : "bg-white",
    border: isDarkMode ? "border-[#2a2d36]" : "border-slate-200",
    text: isDarkMode ? "text-white" : "text-slate-900",
    subText: isDarkMode ? "text-[#9ca3af]" : "text-slate-500",
    inputBg: isDarkMode ? "bg-[#1f2430]" : "bg-slate-50",
    inputDisabledBg: isDarkMode ? "bg-[#181b24]" : "bg-slate-50",
    inputText: isDarkMode ? "text-[#d1d5db]" : "text-slate-700",
  };'''
  
    content = content.replace('  const selectedSessionId = classAndSectionData?.selectedSession?._id;', theme_obj + '\n  const selectedSessionId = classAndSectionData?.selectedSession?._id;')

    # Background
    content = content.replace('className="min-h-screen bg-[#f8fafc] p-6">', 'className={`min-h-screen ${theme.bg} p-6`}>')
    
    # Headers
    content = content.replace('className="text-slate-500 hover:text-slate-700"', 'className={`${theme.subText} hover:opacity-80`}')
    content = content.replace('className="text-slate-500">', 'className={`${theme.subText}`}>')
    content = content.replace('className="text-slate-400">', 'className={`${theme.subText} opacity-70`}>')
    content = content.replace('className="text-2xl font-bold text-slate-900">', 'className={`text-2xl font-bold ${theme.text}`}>')
    content = content.replace('className="mt-2 text-sm text-slate-500">', 'className={`mt-2 text-sm ${theme.subText}`}>')
    content = content.replace('className="mb-3 block text-sm font-semibold text-slate-700">', 'className={`mb-3 block text-sm font-semibold ${theme.text}`}>')
    content = content.replace('className="mt-2 text-xs text-slate-500">', 'className={`mt-2 text-xs ${theme.subText}`}>')
    
    # Cards
    content = content.replace('className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">', 'className={`rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-sm`}>')
    
    # Inputs
    content = content.replace('className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500"', 'className={`h-12 w-full rounded-xl border ${theme.border} ${theme.inputBg} px-4 ${theme.subText}`}')
    content = content.replace('border border-slate-200 px-4 outline-none ${isFeeCycleVerified ? "bg-slate-50 text-slate-500', 'border ${theme.border} px-4 outline-none ${isFeeCycleVerified ? `${theme.inputDisabledBg} ${theme.subText}`')
    content = content.replace(' : "bg-white"}', ' : theme.surface}')
    
    # Previews
    content = content.replace('className="mb-5 text-lg font-semibold text-slate-800">', 'className={`mb-5 text-lg font-semibold ${theme.text}`}>')
    content = content.replace('className="min-w-[90px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">', 'className={`min-w-[90px] rounded-xl border ${theme.border} ${theme.inputBg} p-4 text-center`}>')
    content = content.replace('className="text-lg font-semibold text-slate-800">', 'className={`text-lg font-semibold ${theme.text}`}>')
    content = content.replace('className="mt-3 text-slate-500">', 'className={`mt-3 ${theme.subText}`}>')
    
    # Bottom buttons
    content = content.replace('border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50', '${theme.border} ${theme.surface} px-5 py-3 text-sm font-semibold ${theme.text} transition ${isDarkMode ? "hover:bg-[#1f2430]" : "hover:bg-slate-50"}')
    content = re.sub(r'className="rounded-lg border (.*?)"', r'className={`rounded-lg border \1`}', content)
    
    # Misc text
    content = content.replace('className="text-sm text-slate-700">', 'className={`text-sm ${theme.text}`}>')
    
    # Stepper component
    content = content.replace('background: active ? "#0a81d1" : "#ffffff"', 'background: active ? "#0a81d1" : (isDarkMode ? "#111315" : "#ffffff")')
    content = content.replace('color: active ? "#ffffff" : "#0f0f0f"', 'color: active ? "#ffffff" : (isDarkMode ? "#ffffff" : "#0f0f0f")')
    content = content.replace('border: `1px solid ${active ? "#0a81d1" : "#c4c4c4"}`', 'border: `1px solid ${active ? "#0a81d1" : (isDarkMode ? "#2a2d36" : "#c4c4c4")}`')
    content = content.replace('className="text-sm font-semibold text-[#0f0f0f]">', 'className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-[#0f0f0f]"}`}>')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_view_fees()
update_school_fee_setting()
print('Done!')
