require 'spec_helper'

describe Gitlab::Ci::Status::Stage::Common do
  let(:pipeline) { create(:ci_pipeline) }
  let(:stage) { Ci::Stage.new(pipeline, 'test') }

  subject do
    Class.new(Gitlab::Ci::Status::Core)
      .new(pipeline).extend(described_class)
  end

  it 'does not have action' do
    expect(subject).not_to have_action
  end

  it 'has details' do
    expect(subject).to have_details
  end

  it 'links to the pipeline details page' do
    expect(subject.details_path)
      .to include "pipelines/#{pipeline.id}"
    expect(subject.details_path)
      .to include "##{stage.name}"
  end
end
