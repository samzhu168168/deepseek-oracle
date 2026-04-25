from __future__ import annotations
"""
Example usage of ContextManager
"""
from .context_manager import ContextManager


def example_basic_usage():
    """Basic usage example"""
    manager = ContextManager()
    
    messages = [
        {'role': 'user', 'content': 'Hello, how are you?'},
        {'role': 'assistant', 'content': 'I am doing well, thank you!'},
        {'role': 'user', 'content': 'Can you help me with BaZi analysis?'},
        {'role': 'assistant', 'content': 'Of course! Please provide birth details.'},
    ]
    
    # Count tokens
    token_count = manager.count_messages_tokens(messages)
    print(f"Total tokens: {token_count}")
    
    # Get compression stats
    stats = manager.get_compression_stats(messages)
    print(f"Usage: {stats['usage_percent']}%")
    print(f"Needs compression: {stats['needs_compression']}")
    
    # Compress if needed
    if stats['needs_compression']:
        compressed = manager.compress_if_needed(messages)
        print(f"Compressed from {len(messages)} to {len(compressed)} messages")


def example_with_llm_service():
    """Example with LLM service for summarization"""
    from .llm_service import LLMService
    
    manager = ContextManager()
    llm_service = LLMService()
    
    # Simulate long conversation
    messages = [
        {'role': 'user', 'content': 'Message 1...'},
        {'role': 'assistant', 'content': 'Response 1...'},
        # ... many more messages
    ] * 10  # Simulate 20 messages
    
    # Compress with summary
    compressed = manager.compress_with_summary(messages, llm_service)
    print(f"Compressed from {len(messages)} to {len(compressed)} messages")
    print(f"First message (summary): {compressed[0]['content'][:100]}...")


def example_integration_with_api():
    """Example of integrating with API endpoint"""
    from flask import request, jsonify
    
    def analyze_with_context_management():
        """API endpoint with context management"""
        data = request.get_json()
        messages = data.get('messages', [])
        
        # Create context manager
        manager = ContextManager()
        
        # Check if compression needed
        stats = manager.get_compression_stats(messages)
        
        if stats['needs_compression']:
            # Compress messages
            messages = manager.compress_if_needed(messages)
            
            # Log compression
            print(f"Compressed context: {stats['token_count']} → {manager.count_messages_tokens(messages)} tokens")
        
        # Continue with LLM call using compressed messages
        # result = llm_service.generate(messages)
        
        return jsonify({
            'success': True,
            'compression_applied': stats['needs_compression'],
            'token_savings': stats['token_count'] - manager.count_messages_tokens(messages) if stats['needs_compression'] else 0,
        })


if __name__ == '__main__':
    print("=== Basic Usage ===")
    example_basic_usage()
    
    print("\n=== With LLM Service ===")
    # example_with_llm_service()  # Uncomment when LLM service is available
