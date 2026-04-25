from __future__ import annotations
"""
Tool Registry System
Inspired by Claude Code's declarative tool registration pattern
"""
from typing import Protocol, Any, Dict, List


class Tool(Protocol):
    """Base protocol for all tools"""
    name: str
    description: str
    schema: Dict[str, type]
    
    def execute(self, **kwargs) -> Any:
        """Execute the tool with given parameters"""
        ...


class ToolRegistry:
    """Central registry for all tools"""
    
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool) -> None:
        """Register a new tool"""
        self._tools[tool.name] = tool
    
    def get(self, name: str) -> Tool | None:
        """Get a tool by name"""
        return self._tools.get(name)
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """List all registered tools"""
        return [
            {
                'name': tool.name,
                'description': tool.description,
                'schema': tool.schema,
            }
            for tool in self._tools.values()
        ]
    
    def execute(self, name: str, **kwargs) -> Any:
        """Execute a tool by name"""
        tool = self.get(name)
        if not tool:
            raise ValueError(f"Tool '{name}' not found")
        return tool.execute(**kwargs)


# Global registry instance
registry = ToolRegistry()


def register_tool(tool: Tool) -> None:
    """Convenience function to register a tool"""
    registry.register(tool)


def get_tool(name: str) -> Tool | None:
    """Convenience function to get a tool"""
    return registry.get(name)


def list_tools() -> List[Dict[str, Any]]:
    """Convenience function to list all tools"""
    return registry.list_tools()


def execute_tool(name: str, **kwargs) -> Any:
    """Convenience function to execute a tool"""
    return registry.execute(name, **kwargs)
