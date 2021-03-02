/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TextFragmentLanguageEditing from '../src/textfragmentlanguageediting';
import TextFragmentLanguageCommand from '../src/textfragmentlanguagecommand';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'TextFragmentLanguageEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TextFragmentLanguageEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	it( 'should have pluginName', () => {
		expect( TextFragmentLanguageEditing.pluginName ).to.equal( 'TextFragmentLanguageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TextFragmentLanguageEditing ) ).to.be.instanceOf( TextFragmentLanguageEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'language' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'language' ) ).to.be.true;
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'language' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register textFragmentLanguage command', () => {
			const command = editor.commands.get( 'textFragmentLanguage' );
			expect( command ).to.be.instanceOf( TextFragmentLanguageCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert lang to language attribute', () => {
			editor.setData( '<p><span lang="fr">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="ltr">foo</span>bar</p>' );
		} );

		it( 'should respect dir attribute', () => {
			editor.setData( '<p><span lang="fr" dir="rtl">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:rtl">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="rtl">foo</span>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<span lang="fr">foo</span>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="ltr">foo</span>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span dir="ltr" lang="fr">foo</span>bar</p>' );
		} );
	} );

	describe( 'config', () => {
		it( 'should be set', () => {
			expect( editor.config.get( 'language.textFragmentLanguage' ) ).to.deep.equal( [
				{ title: 'Arabic', languageCode: 'ar' },
				{ title: 'French', languageCode: 'fr' },
				{ title: 'Spanish', languageCode: 'es' }
			] );
		} );

		it( 'should be customizable', async () => {
			const languageConfig = {
				ui: 'pl',
				content: 'pl',
				textFragmentLanguage: [
					{ title: 'Hebrew', languageCode: 'he' },
					{ title: 'Polish', languageCode: 'pl' }
				]
			};

			await createCustomConfigEditor( languageConfig );

			expect( editor.config.get( 'language' ) ).to.deep.equal( languageConfig );
		} );

		function createCustomConfigEditor( languageConfig ) {
			return VirtualTestEditor
				.create( {
					plugins: [ TextFragmentLanguageEditing, Paragraph ],
					language: languageConfig
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		}
	} );
} );
