import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { MessageService } from '../shared/messages/message.service';

import { Character } from './characterModels/character';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterUrl = environment.apiUrl + '/api/characters';

  constructor(
    private httpClient: HttpClient,
    private messageService: MessageService
  ) {}

  getCharacters(): Observable<Character[]> {
    return this.httpClient.get<any[]>(this.characterUrl).pipe(
      map((ch) => {
        const characters = [];
        for (const response of ch) {
          response.skills = [];
          response.weapons = [];
          response.spells = [];
          response.notes = [];
          response.saves = [];
          characters.push(new Character(null, response as any));
        }
        const outcome = `Got ${ch.length} character.`;
        this.messageService.add(outcome);
        return characters;
      }),
      catchError(this.handleError('get characters', []))
    );
  }

  getCharacter(id): Observable<Character> {
    return this.httpClient.get<any>(this.characterUrl + '/' + id).pipe(
      map((response) => {
        const character = new Character(null, response);
        return character;
      }),
      catchError(this.handleError('get character', null))
    );
  }

  getUserCharacters(userId): Observable<Character[]> {
    return this.httpClient
      .get<any[]>(this.characterUrl + '/user/' + userId, {
        headers: {
          authorization: 'Bearer ' + sessionStorage.getItem('userToken')
        },
        withCredentials: true
      })
      .pipe(
        map((ch) => {
          const characters = [];
          for (const response of ch) {
            response.skills = [];
            response.weapons = [];
            response.spells = [];
            response.notes = [];
            response.saves = [];
            characters.push(new Character(null, response as any));
          }
          const outcome = `Got ${ch.length} character.`;
          this.messageService.add(outcome);
          return characters;
        }),
        catchError(this.handleError('get characters', []))
      );
  }

  private handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      console.error(error.message);
      const errMsg =
        'ERROR IN ' + operation.toUpperCase() + ': ' + error.message;
      this.messageService.add(errMsg);
      return of(result as T);
    };
  }

  saveCharCopy(character: Character): void {
    const characterString = JSON.stringify(character);
    const blob = new Blob([characterString], {
      type: 'application/json'
    });
    FileSaver.saveAs(blob, character.getName() + '_zeldaplay.json');
  }

  saveCharDb(character: Character): Observable<any> {
    const userId = sessionStorage.getItem('currentUser');
    return this.httpClient.post<any>(
      this.characterUrl + `/${userId}`,
      {
        character
      },
      {
        headers: {
          authorization: 'Bearer ' + sessionStorage.getItem('userToken')
        }
      }
    );
  }
}
