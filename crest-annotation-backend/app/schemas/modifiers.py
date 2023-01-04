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


def create(*optional):
    """
    Decorator to modify an existing pydantic model for create requests

    Given fields will be changed to optional
    """

    def dec(_cls):
        for field in optional:
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

    Source from https://github.com/samuelcolvin/pydantic/issues/1223#issuecomment-775363074
    """

    def dec(_cls):
        for field in fields:
            _cls.__fields__[field].required = False
        return _cls

    if fields and inspect.isclass(fields[0]) and issubclass(fields[0], BaseModel):
        cls = fields[0]
        fields = cls.__fields__
        return dec(cls)

    return dec
