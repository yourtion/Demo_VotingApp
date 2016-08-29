'use strict';

import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import Character from './components/Character';
import CharacterList from './components/CharacterList';
import AddCharacter from './components/AddCharacter';
import Stats from './components/Stats';

export default (
  <Route component={App}>
    <Route path='/' component={Home} />
    <Route path='/add' component={AddCharacter} />
    <Route path='/characters/:id' component={Character} />
    <Route path='/shame' component={CharacterList} />
    <Route path='/stats' component={Stats} />
    <Route path=':category' component={CharacterList}>
      <Route path=':race' component={CharacterList}>
        <Route path=':bloodline' component={CharacterList} />
      </Route>
    </Route>
  </Route>
);
