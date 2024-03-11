import inspect

from pydantic import BaseModel


def patch(*identifiers):
    """
    Decorator to modify an existing pydantic model for patch requests

    All fields except an identifier will be changed to optional
    """

    def dec(_cls):
        for field in _cls.__fields__:
            if field not in identifiers:
                _cls.__fields__[field].required = False
        return _cls

    return dec


def create(*optionals):
    """
    Decorator to modify an existing pydantic model for create requests

    Given fields will be changed to optional
    """

    def dec(_cls):
        for field in optionals:
            _cls.__fields__[field].required = False
        return _cls

    return dec


def response(*hidden):
    """
    Decorator to modify an existing pydantic model for responses

    Any hidden fields will be removed
    """

    def dec(_cls):
        for field in hidden:
            del _cls.__fields__[field]
        return _cls

    return dec


def optional(*fields):
    """
    Decorator to mark pydantic fields as optional
    """

    def dec(_cls):
        for field in fields:
            _cls.__fields__[field].required = False
        return _cls

    return dec
