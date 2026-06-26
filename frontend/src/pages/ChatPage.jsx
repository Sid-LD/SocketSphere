import React from 'react'
import toast from 'react-hot-toast'

function ChatPage() {
  return (
    <div>
      Chat page
      <button onClick={()=>toast.success("U just clicked")}>Click me</button>
    </div>
  )
}

export default ChatPage
