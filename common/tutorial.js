class Tutorial
{
	constructor()
	{
		this._state = 0;
		this._complete = false;
		this._active = false;
		this._ui = new Object();
		this._disableStandardUI = false;
		this._drawer = null;
	}
	set drawer(f)
	{
		this._drawer = f;
	}
	get drawer()
	{
		return this._drawer;
	}
	complete()
	{
		this._complete = true;
		this._active = false;
		this._state = 0;
	}
	get state()
	{
		return this._state;
	}
	set state(value)
	{
		this._state = value;
	}
	get active()
	{
		return this._active;
	}
	disableStandardUI()
	{
		this._disableStandardUI	= true;
	}
	enableStandardUI()
	{
		this._disableStandardUI	= true;
	}
	get standardUIDisable()
	{
		return this._disableStandardUI;
	}
	draw(context)
	{
		if (this._active)
		{
			if (this._drawer !== null)
				this._drawer(context,this._state);
			if (this._ui[this._state] !== undefined)
			{
				var i;
				for (i = 0; i < this._ui[this._state].length; i++)
				{
					this._ui[this._state][i].draw(context);
				}
			}
		}
	}
	advanceState()
	{
		this._state++;
	}
	rewindState()
	{
		if (g_tutorial.state > 0)
			this._state--;
	}
	activate()
	{
		this._complete = false;
		this._active = true;
		this._state = 0;
	}
	deactivate()
	{
		this._active = false;
	}
	addUI(state,ui)
	{
		if (this._ui[state] === undefined)
		{
			this._ui[state] = new Array();
		}
		this._ui[state].push(ui);
	}
	
	onClick(event)
	{
		if (this._active && this._ui[this._state] !== undefined)
		{
			var i;
			for (i = 0; i < this._ui[this._state].length; i++)
			{
				if (this._ui[this._state][i].test(event))
				{
					this._ui[this._state][i].onClick(event);
				}
			}
		}
	}
}
