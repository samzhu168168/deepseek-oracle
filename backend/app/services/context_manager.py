"""
Context Manager for LLM Token Management
Inspired by Claude Code's three-layer compression strategy
"""
from typing import List, Dict, Any


class ContextManager:
    """
    Manages LLM context to stay within token limits.
    
    Three-layer compression strategy:
    1. Dynamic window: Keep recent N messages
    2. Auto-compress: Summarize old messages
    3. Micro-compress: Remove tool call details
    """
    
    MAX_TOKENS = 8000  # Conservative limit
    RECENT_MESSAGES_COUNT = 5  # Always keep recent 5 messages
    
    def __init__(self, model: str = 'gpt-4'):
        self.model = model
        self._encoder = None
    
    def _get_encoder(self):
        """Lazy load tiktoken encoder"""
        if self._encoder is None:
            try:
                import tiktoken
                self._encoder = tiktoken.encoding_for_model(self.model)
            except ImportError:
                # Fallback: rough estimation (4 chars ≈ 1 token)
                self._encoder = None
        return self._encoder
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text.
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Number of tokens
        """
        encoder = self._get_encoder()
        
        if encoder:
            return len(encoder.encode(text))
        else:
            # Fallback estimation: 4 chars ≈ 1 token
            return len(text) // 4
    
    def count_messages_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """
        Count total tokens in message list.
        
        Args:
            messages: List of message dicts with 'content' field
            
        Returns:
            Total token count
        """
        total = 0
        for msg in messages:
            content = msg.get('content', '')
            if isinstance(content, str):
                total += self.count_tokens(content)
            elif isinstance(content, list):
                # Handle multi-part content
                for part in content:
                    if isinstance(part, dict) and 'text' in part:
                        total += self.count_tokens(part['text'])
        return total
    
    def compress_if_needed(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Compress messages if they exceed token limit.
        
        Layer 1: Dynamic window (keep recent N messages)
        
        Args:
            messages: List of messages
            
        Returns:
            Compressed message list
        """
        token_count = self.count_messages_tokens(messages)
        
        if token_count <= self.MAX_TOKENS:
            return messages
        
        # Layer 1: Keep only recent messages
        if len(messages) > self.RECENT_MESSAGES_COUNT:
            compressed = messages[-self.RECENT_MESSAGES_COUNT:]
            return compressed
        
        return messages
    
    def compress_with_summary(
        self, 
        messages: List[Dict[str, Any]], 
        llm_service=None
    ) -> List[Dict[str, Any]]:
        """
        Compress messages using LLM summarization.
        
        Layer 2: Auto-compress (summarize old messages)
        
        Args:
            messages: List of messages
            llm_service: LLM service for generating summary
            
        Returns:
            Compressed message list with summary
        """
        if len(messages) <= self.RECENT_MESSAGES_COUNT:
            return messages
        
        # Split into old and recent
        old_messages = messages[:-self.RECENT_MESSAGES_COUNT]
        recent_messages = messages[-self.RECENT_MESSAGES_COUNT:]
        
        if not llm_service:
            # Fallback: just keep recent
            return recent_messages
        
        # Generate summary of old messages
        summary_prompt = self._build_summary_prompt(old_messages)
        
        try:
            summary = llm_service.generate_simple(summary_prompt)
            
            # Create summary message
            summary_message = {
                'role': 'system',
                'content': f'Previous conversation summary: {summary}'
            }
            
            return [summary_message] + recent_messages
            
        except Exception as e:
            print(f"Summary generation failed: {e}")
            return recent_messages
    
    def micro_compress(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Micro-compress by removing tool call details.
        
        Layer 3: Micro-compress (remove tool details, keep results)
        
        Args:
            messages: List of messages
            
        Returns:
            Micro-compressed message list
        """
        compressed = []
        
        for msg in messages:
            if msg.get('type') == 'tool_use':
                # Keep tool name but truncate input
                compressed_msg = msg.copy()
                if 'input' in compressed_msg:
                    compressed_msg['input'] = '[truncated]'
                compressed.append(compressed_msg)
            else:
                compressed.append(msg)
        
        return compressed
    
    def _build_summary_prompt(self, messages: List[Dict[str, Any]]) -> str:
        """Build prompt for summarizing old messages"""
        conversation = "\n\n".join([
            f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
            for msg in messages
        ])
        
        return f"""Summarize the following conversation in 2-3 sentences, 
focusing on key decisions, important information, and context needed 
for continuing the conversation:

{conversation}

Summary:"""
    
    def get_compression_stats(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get compression statistics.
        
        Args:
            messages: List of messages
            
        Returns:
            Dict with token count and compression recommendations
        """
        token_count = self.count_messages_tokens(messages)
        
        return {
            'token_count': token_count,
            'max_tokens': self.MAX_TOKENS,
            'usage_percent': round(token_count / self.MAX_TOKENS * 100, 2),
            'needs_compression': token_count > self.MAX_TOKENS,
            'recommended_action': self._get_compression_recommendation(token_count),
        }
    
    def _get_compression_recommendation(self, token_count: int) -> str:
        """Get compression recommendation based on token count"""
        if token_count <= self.MAX_TOKENS * 0.7:
            return 'no_action'
        elif token_count <= self.MAX_TOKENS:
            return 'monitor'
        elif token_count <= self.MAX_TOKENS * 1.5:
            return 'compress_window'
        else:
            return 'compress_with_summary'


# Convenience function
def create_context_manager(model: str = 'gpt-4') -> ContextManager:
    """Create a context manager instance"""
    return ContextManager(model=model)
