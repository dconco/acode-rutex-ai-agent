import panel from './panel.html'

const renderPanel = container => {
	container.style.padding = '0'
	container.innerHTML = panel

	/* ── Refs ─────────────────────────────────────── */
	const msgsInner = container.querySelector('#msgs-inner')
	const msgsWrap = container.querySelector('#msgs-wrap')
	const emptyState = container.querySelector('#empty-state')
	const inputEl = container.querySelector('#chat-input')
	const sendBtn = container.querySelector('#send-btn')
	const sendIcon = container.querySelector('#send-icon')
	const stopIcon = container.querySelector('#stop-icon')
	const charCount = container.querySelector('#char-count')
	const modelSel = container.querySelector('#model-select')
	const ctxBar = container.querySelector('#ctx-bar')
	const ctxAddBtn = container.querySelector('#ctx-add-btn')
	const newChatBtn = container.querySelector('#new-chat-btn')
	const attachBtn = container.querySelector('#attach-btn')
	const selBtn = container.querySelector('#sel-btn')
	const clearBtn = container.querySelector('#clear-btn')

	/* ── State ────────────────────────────────────── */
	let messages = [] // { role:'user'|'ai', text, ctxName? }
	let ctxFiles = [] // { name, content }
	let isStreaming = false
	let abortFn = null

	/* ── Suggestions ──────────────────────────────── */
	container.querySelectorAll('.sug-chip').forEach(chip => {
		chip.onclick = () => {
			inputEl.value = chip.dataset.prompt
			inputEl.focus()
			resize()
			updateCount()
		}
	})

	/* ── Textarea ─────────────────────────────────── */
	function resize() {
		inputEl.style.height = 'auto'
		inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px'
	}
	function updateCount() {
		const n = inputEl.value.length
		charCount.textContent = n || '0'
		charCount.classList.toggle('warn', n > 2000)
	}
	inputEl.oninput = () => {
		resize()
		updateCount()
	}
	inputEl.onkeydown = e => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			isStreaming ? stopStream() : handleSend()
		}
	}

	/* ── Buttons ──────────────────────────────────── */
	sendBtn.onclick = () => (isStreaming ? stopStream() : handleSend())

	newChatBtn.onclick = () => {
		messages = []
		renderAll()
	}
	clearBtn.onclick = () => {
		messages = []
		renderAll()
	}

	ctxAddBtn.onclick = () => {
		container.dispatchEvent(
			new CustomEvent('ai-panel-get-file', {
				detail: {
					onFile: ({ name, content }) => {
						if (!ctxFiles.find(f => f.name === name)) {
							ctxFiles.push({ name, content })
							renderCtxBar()
						}
					}
				}
			})
		)
	}
	attachBtn.onclick = () => ctxAddBtn.click()

	selBtn.onclick = () => {
		container.dispatchEvent(
			new CustomEvent('ai-panel-get-selection', {
				detail: {
					onSelection: text => {
						if (!text) return
						inputEl.value += '\n```\n' + text + '\n```\n'
						resize()
						updateCount()
						inputEl.focus()
					}
				}
			})
		)
	}

	/* ── Context Bar ──────────────────────────────── */
	function renderCtxBar() {
		ctxBar.querySelectorAll('.ctx-chip').forEach(c => c.remove())
		ctxFiles.forEach((f, i) => {
			const chip = container.createElement('div')
			chip.className = 'ctx-chip'
			chip.innerHTML = `
     <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
     <span class="ctx-chip-name">${esc(f.name)}</span>
     <button class="ctx-remove" title="Remove">
       <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
     </button>`
			chip.querySelector('.ctx-remove').addEventListener('click', () => {
				ctxFiles.splice(i, 1)
				renderCtxBar()
			})
			ctxBar.insertBefore(chip, ctxAddBtn)
		})
	}

	/* ── Render all messages ──────────────────────── */
	function renderAll() {
		msgsInner
			.querySelectorAll('.msg-row, .thinking-row')
			.forEach(n => n.remove())
		emptyState.style.display = messages.length === 0 ? 'flex' : 'none'
		messages.forEach((m, i) => msgsInner.appendChild(buildRow(m, i)))
		scrollBottom()
	}

	/* ── Build row ────────────────────────────────── */
	function buildRow(msg, idx) {
		const row = container.createElement('div')
		row.className = 'msg-row ' + msg.role
		row.dataset.idx = idx

		if (msg.role === 'user') {
			row.innerHTML = `
     <div class="msg-meta">
       <div class="msg-avatar user-av"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
       <span class="msg-name">you</span>
     </div>
     <div class="user-bubble">
       ${
				msg.ctxName
					? `<div class="user-ctx-chip"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>${esc(
							msg.ctxName
					  )}</div>`
					: ''
			}
       ${esc(msg.text)}
     </div>
     <div class="msg-actions">
       <button class="act-btn copy-btn" title="Copy">
         <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> copy
       </button>
       <button class="act-btn edit-btn" title="Edit &amp; resend">
         <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> edit
       </button>
     </div>`

			row.querySelector('.copy-btn').addEventListener('click', () =>
				copyText(msg.text, row.querySelector('.copy-btn'))
			)
			row.querySelector('.edit-btn').addEventListener('click', () => {
				inputEl.value = msg.text
				messages.splice(idx)
				renderAll()
				resize()
				updateCount()
				inputEl.focus()
			})
		} else {
			row.innerHTML = `
     <div class="msg-meta">
       <div class="msg-avatar ai-av"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
       <span class="msg-name">Rutex AI Agent</span>
     </div>
     <div class="ai-content">${renderMD(msg.text)}</div>
     <div class="msg-actions">
       <button class="act-btn copy-btn" title="Copy">
         <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> copy
       </button>
       <button class="act-btn regen-btn" title="Retry">
         <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2.7-6.7L23 10"/></svg> retry
       </button>
       <button class="act-btn thumbup-btn" title="Good">
         <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
       </button>
       <button class="act-btn thumbdn-btn" title="Bad">
         <svg viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
       </button>
     </div>`

			attachCodeBtns(row.querySelector('.ai-content'))
			row.querySelector('.copy-btn').addEventListener('click', () =>
				copyText(msg.text, row.querySelector('.copy-btn'))
			)
			row.querySelector('.regen-btn').addEventListener('click', () => {
				if (idx > 0) {
					const prev = messages[idx - 1]
					messages.splice(idx - 1, 2)
					renderAll()
					sendMessage(prev.text, prev.ctxName, null)
				}
			})
			row.querySelector('.thumbup-btn').addEventListener('click', e =>
				e.currentTarget.classList.toggle('active')
			)
			row.querySelector('.thumbdn-btn').addEventListener('click', e =>
				e.currentTarget.classList.toggle('active')
			)
		}
		return row
	}

	/* ── Stop stream ──────────────────────────────── */
	function stopStream() {
		if (abortFn) {
			abortFn()
			abortFn = null
		}
		endStream()
	}
	function endStream() {
		isStreaming = false
		sendIcon.style.display = ''
		stopIcon.style.display = 'none'
		sendBtn.classList.remove('stop')
		sendBtn.disabled = false
		msgsInner
			.querySelectorAll('.thinking-row, .stream-cursor')
			.forEach(n => n.remove())
		renderAll()
	}

	/* ── Handle send ──────────────────────────────── */
	function handleSend() {
		const text = inputEl.value.trim()
		if (!text) return
		const ctxContent = ctxFiles.length
			? ctxFiles.map(f => `// ${f.name}\n${f.content}`).join('\n\n---\n\n')
			: null
		const ctxName = ctxFiles.length
			? ctxFiles.map(f => f.name).join(', ')
			: null
		inputEl.value = ''
		inputEl.style.height = 'auto'
		updateCount()
		sendMessage(text, ctxName, ctxContent)
	}

	function sendMessage(text, ctxName, ctxContent) {
		messages.push({ role: 'user', text, ctxName })
		emptyState.style.display = 'none'
		renderAll()

		// Thinking indicator
		const thinking = container.createElement('div')
		thinking.className = 'thinking-row'
		thinking.innerHTML = `<div class="thinking-dots"><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div></div><span class="thinking-label">thinking…</span>`
		msgsInner.appendChild(thinking)
		scrollBottom()

		isStreaming = true
		sendIcon.style.display = 'none'
		stopIcon.style.display = ''
		sendBtn.classList.add('stop')
		sendBtn.disabled = false

		// Build API messages
		const apiMsgs = [
			{
				role: 'system',
				content: ctxContent
					? `You are an expert AI coding assistant in the Acode mobile editor. Be concise and format code in fenced blocks with language identifiers.\n\nFile context:\n${ctxContent}`
					: `You are an expert AI coding assistant in the Acode mobile editor. Be concise, helpful, and format all code in fenced blocks with the language identifier.`
			}
		]
		messages.forEach(m => {
			if (m.text)
				apiMsgs.push({
					role: m.role === 'user' ? 'user' : 'assistant',
					content: m.text
				})
		})

		let aiText = ''
		let aiIdx = null
		let liveRow = null
		let liveContent = null

		container.dispatchEvent(
			new CustomEvent('ai-panel-send', {
				detail: {
					messages: apiMsgs,
					model: modelSel.value,
					setAbort: fn => {
						abortFn = fn
					},
					onChunk: chunk => {
						if (aiIdx === null) {
							thinking.remove()
							messages.push({ role: 'ai', text: '' })
							aiIdx = messages.length - 1
							liveRow = container.createElement('div')
							liveRow.className = 'msg-row ai'
							liveRow.innerHTML = `
           <div class="msg-meta">
             <div class="msg-avatar ai-av"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>
             <span class="msg-name">AI Agent</span>
           </div>
           <div class="ai-content" id="live-ai-content"></div>`
							msgsInner.appendChild(liveRow)
							liveContent = liveRow.querySelector('#live-ai-content')
						}
						aiText += chunk
						messages[aiIdx].text = aiText
						if (liveContent) {
							liveContent.innerHTML =
								renderMD(aiText) + '<span class="stream-cursor"></span>'
							attachCodeBtns(liveContent)
						}
						scrollBottom()
					},
					onDone: () => {
						abortFn = null
						endStream()
					},
					onError: err => {
						thinking.remove()
						messages.push({
							role: 'ai',
							text:
								'**Error:** ' +
								esc(err || 'Something went wrong. Check your API key.')
						})
						abortFn = null
						endStream()
					}
				}
			})
		)
	}

	/* ── Markdown ─────────────────────────────────── */
	function renderMD(raw) {
		let h = esc(raw)

		// Fenced code blocks
		h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
			const l = lang || 'code'
			const enc = btoa(unescape(encodeURIComponent(code.trimEnd())))
			return `<div class="code-block">
     <div class="code-header">
       <span class="code-lang">${esc(l)}</span>
       <div class="code-actions">
         <button class="code-btn copy-code-btn" data-enc="${enc}">
           <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>copy
         </button>
         <button class="code-btn insert-code-btn" data-enc="${enc}">
           <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>insert
         </button>
       </div>
     </div>
     <div class="code-body">${esc(code.trimEnd())}</div>
   </div>`
		})

		// Headings
		h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>')

		// Bold / italic
		h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		h = h.replace(/\*(.+?)\*/g, '<em>$1</em>')

		// Blockquote
		h = h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')

		// Lists
		h = h.replace(/((?:^[-*] .+(?:\n|$))+)/gm, blk => {
			const items = blk
				.trim()
				.split('\n')
				.map(l => `<li>${l.replace(/^[-*] /, '')}</li>`)
				.join('')
			return `<ul>${items}</ul>`
		})
		h = h.replace(/((?:^\d+\. .+(?:\n|$))+)/gm, blk => {
			const items = blk
				.trim()
				.split('\n')
				.map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`)
				.join('')
			return `<ol>${items}</ol>`
		})

		// Inline code
		h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>')

		// Paragraphs
		h = h.replace(/\n{2,}/g, '</p><p>')
		h = h.replace(/\n/g, '<br>')
		h = '<p>' + h + '</p>'

		// Unwrap p around block elements
		h = h.replace(/<p>(<(?:div|ul|ol|h[1-3]|blockquote))/g, '$1')
		h = h.replace(/((?:div|ul|ol|h[1-3]|blockquote)>)<\/p>/g, '$1')

		return h
	}

	/* ── Code button listeners ────────────────────── */
	function attachCodeBtns(root) {
		if (!root) return
		root.querySelectorAll('.copy-code-btn:not([data-b])').forEach(btn => {
			btn.dataset.b = '1'
			btn.addEventListener('click', () => {
				copyText(decode(btn.dataset.enc), btn)
			})
		})
		root.querySelectorAll('.insert-code-btn:not([data-b])').forEach(btn => {
			btn.dataset.b = '1'
			btn.addEventListener('click', () => {
				const code = decode(btn.dataset.enc)
				container.dispatchEvent(
					new CustomEvent('ai-panel-insert', {
						detail: { code }
					})
				)
				const origHTML = btn.innerHTML
				btn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>inserted!`
				btn.classList.add('inserted')
				setTimeout(() => {
					btn.innerHTML = origHTML
					btn.classList.remove('inserted')
				}, 1800)
			})
		})
	}

	/* ── Clipboard ────────────────────────────────── */
	function copyText(text, btn) {
		const done = () => {
			if (!btn) return
			const orig = btn.innerHTML
			btn.innerHTML = `<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> copied!`
			btn.classList.add('copied')
			setTimeout(() => {
				btn.innerHTML = orig
				btn.classList.remove('copied')
			}, 1800)
		}
		if (navigator.clipboard) navigator.clipboard.writeText(text).then(done)
		else {
			const ta = Object.assign(container.createElement('textarea'), {
				value: text
			})
			ta.style.cssText = 'position:fixed;opacity:0'
			container.body.appendChild(ta)
			ta.select()
			container.execCommand('copy')
			ta.remove()
			done()
		}
	}

	/* ── Helpers ──────────────────────────────────── */
	function esc(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
	}
	function decode(enc) {
		try {
			return decodeURIComponent(escape(atob(enc)))
		} catch (e) {
			return ''
		}
	}
	function scrollBottom() {
		msgsWrap.scrollTop = msgsWrap.scrollHeight
	}

	/* ── Public API for main.js ───────────────────── */
	window.aiPanel = {
		addContext: (name, content) => {
			ctxFiles.push({ name, content })
			renderCtxBar()
		},
		clearContext: () => {
			ctxFiles = []
			renderCtxBar()
		},
		setModel: m => {
			modelSel.value = m
		},
		clear: () => {
			messages = []
			renderAll()
		}
	}

	renderCtxBar()
	renderAll()
	inputEl.focus()
}

export { renderPanel }
