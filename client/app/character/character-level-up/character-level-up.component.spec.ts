import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Character } from '../characterModels/character';
import { CharacterLevelUpComponent } from './character-level-up.component';

describe('CharacterLevelUpComponent', () => {
  let component: CharacterLevelUpComponent;
  let fixture: ComponentFixture<CharacterLevelUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CharacterLevelUpComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterLevelUpComponent);
    component = fixture.componentInstance;
    component.currChar = new Character();
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('toggle functions', () => {
    test('showTab function', () => {
      const attributeTab = component.attributeTab;
      component.showTab(1);
      expect(component.attributeTab).not.toBe(attributeTab);
      component.showTab(0);
      expect(component.attributeTab).toBe(attributeTab);
    });
    test('showSkillTab function', () => {
      const skillTabIndex = [];
      for (const showSkill of component.skillTypeTab) {
        skillTabIndex.push(showSkill);
      }
      for (let i = 0; i < component.skillTypeTab.length; i++) {
        component.showSkillTab(i);
        expect(component.skillTypeTab[i]);
        expect(!component.skillTypeTab[(i + 1) % 3]);
        expect(!component.skillTypeTab[(i + 2) % 3]);
      }
    });
  });
  test('getMod function', () => {
    expect(component.getMod('Strength')).toBe(-1);
  });
  describe('track and validate attribute', () => {
    test('increase attribute to odd number', () => {
      const attrPoints = component.attrPoints;
      component.currChar.getAttributes()[0].changeValue(1);
      component.trackAtt(0);
      expect(component.attrPrior[0]).toBe(
        component.currChar.getAttributes()[0].getValue()
      );
      expect(component.attrPoints).toBe(attrPoints - 1);
    });
    test('increase attribute to even number', () => {
      component.attrPoints = 10;
      const attrPoints = component.attrPoints;
      component.currChar.getAttributes()[0].changeValue(2);
      component.trackAtt(0);
      expect(component.attrPrior[0]).toBe(
        component.currChar.getAttributes()[0].getValue()
      );
      expect(component.attrPoints).toBe(attrPoints - 2);
    });
    test('validate an attribute allocation (VALID)', () => {
      component.attrPoints = 1;
      component.currChar.getAttributes()[0].changeValue(1);
      component.trackAtt(0);
      component.validateAttr(0);
      expect(document.getElementById('attr0').classList).not.toContain(
        'bad-input'
      );
    });
    test('validate an attribute allocation (INVALID TOO MANY) again (VALID)', () => {
      component.attrPoints = 1;
      component.currChar.getAttributes()[0].changeValue(2);
      component.trackAtt(0);
      component.validateAttr(0);
      expect(document.getElementById('attr0').classList).toContain('bad-input');
      component.currChar.getAttributes()[0].changeValue(-1);
      component.trackAtt(0);
      component.validateAttr(0);
      expect(document.getElementById('attr0').classList).not.toContain(
        'bad-input'
      );
    });
    test('validate an attribute allocation (INVALID REVERTED VALUE) again (VALID)', () => {
      component.attrPoints = 10;
      component.currChar.getAttributes()[0].changeValue(-2);
      component.trackAtt(0);
      component.validateAttr(0);
      expect(document.getElementById('attr0').classList).toContain('bad-input');
      component.currChar.getAttributes()[0].changeValue(3);
      component.trackAtt(0);
      component.validateAttr(0);
      expect(document.getElementById('attr0').classList).not.toContain(
        'bad-input'
      );
    });
  });
  describe('track and validate skill', () => {
    test('increase skill', () => {
      const start = component.currChar.getSkills()[0].getRanks();
      component.skillPoints = 10;
      component.currChar
        .getSkills()[0]
        .setRanks(component.currChar.getWeaponSkills()[0].getRanks() + 5);
      component.track(0, 'skills');
      expect(component.currChar.getSkills()[0].getRanks()).toBe(start + 5);
    });
    test('validate skill increase (VALID)', () => {
      component.showTab(1);
      component.showSkillTab(1);
      const start = component.currChar.getWeaponSkills()[0].getRanks();
      component.skillPoints = 10;
      component.currChar
        .getWeaponSkills()[0]
        .setRanks(component.currChar.getWeaponSkills()[0].getRanks() + 8);
      fixture.detectChanges();
      component.track(0, 'weaponSkills');
      component.validate(0, 'weaponSkills');
      expect(document.getElementById('weaponSkills0').classList).not.toContain(
        'bad-input'
      );
    });
    test('validate skill increase (INVALID TOO MANY) and again (VALID)', () => {
      component.showTab(1);
      component.showSkillTab(1);
      const start = (component.skillPoints = 5);
      component.skillPoints = 5;
      component.currChar
        .getWeaponSkills()[0]
        .setRanks(component.currChar.getWeaponSkills()[0].getRanks() + 8);
      fixture.detectChanges();
      component.track(0, 'weaponSkills');
      component.validate(0, 'weaponSkills');
      expect(document.getElementById('weaponSkills0').classList).toContain(
        'bad-input'
      );
      expect(component.currChar.getWeaponSkills()[0].getRanks()).toBe(start);
      component.currChar
        .getWeaponSkills()[0]
        .setRanks(component.currChar.getWeaponSkills()[0].getRanks());
      component.track(0, 'weaponSkills');
      component.validate(0, 'weaponSkills');
      expect(document.getElementById('weaponSkills0').classList).not.toContain(
        'bad-input'
      );
      expect(component.currChar.getWeaponSkills()[0].getRanks()).toBe(
        start + 0
      );
    });
    test('validate skill increase (INVALID REVERTED VALUE) and again (VALID)', () => {
      component.showTab(1);
      component.showSkillTab(2);
      const start = component.currChar.getMagicSkills()[0].getRanks();
      component.skillPoints = 5;
      component.currChar
        .getMagicSkills()[0]
        .setRanks(component.currChar.getMagicSkills()[0].getRanks() - 8);
      fixture.detectChanges();
      component.track(0, 'magicSkills');
      component.validate(0, 'magicSkills');
      expect(document.getElementById('magicSkills0').classList).toContain(
        'bad-input'
      );
      expect(component.currChar.getMagicSkills()[0].getRanks()).toBe(start);
      component.currChar
        .getMagicSkills()[0]
        .setRanks(component.currChar.getMagicSkills()[0].getRanks() + 3);
      component.track(0, 'magicSkills');
      component.validate(0, 'magicSkills');
      expect(document.getElementById('magicSkills0').classList).not.toContain(
        'bad-input'
      );
      expect(component.currChar.getMagicSkills()[0].getRanks()).toBe(start + 3);
    });
  });
});
